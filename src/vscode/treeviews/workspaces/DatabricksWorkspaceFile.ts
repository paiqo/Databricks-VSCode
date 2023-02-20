import * as vscode from 'vscode';

import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';
import { Helper } from '../../../helpers/Helper';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceFile extends DatabricksWorkspaceTreeItem {

	constructor(
		path: string,
		object_id: number,
		parent: DatabricksWorkspaceTreeItem
	) {
		super(path, "FILE", object_id, parent, undefined, vscode.TreeItemCollapsibleState.None);

		this._isInitialized = true;

		this.init();
	}

	async init(): Promise<void> {
		super.init();

		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if(this._isInitialized)
		{
			super.label = this.path.split('/').pop();
			super.tooltip = this._tooltip;
			super.description = this._description;
			super.contextValue = this._contextValue;
			super.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			};
			super.command = this._command;
		}
	}

	get _tooltip(): string {
		let tooltip: string = "[Online only]";
		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		let ret: string;

		ret = "[FILE] - " + this.path;

		return ret;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		let states: string[] = [];

		if (this.localPathExists) {
			states.push("UPLOAD");
			states.push("OPENEXPLORER");
		}
		if (this.onlinePathExists) {
			states.push("DOWNLOAD")
		}
		if (this.localPathExists && this.onlinePathExists) {
			states.push("COMPARE")
		}

		// use , as separator to allow to check for ,<value>, in package.json when condition
		return "," + states.join(",") + ",";
	}

	protected getIconPath(theme: string): vscode.Uri {
		let sync_state: string = "";

		if (this.localPathExists && !this.onlinePathExists) { sync_state = "_OFFLINE"; }
		if (!this.localPathExists && this.onlinePathExists) { sync_state = "_ONLINE"; }

		// TODO: change once new icons exist
		sync_state = ""; 
		return vscode.Uri.joinPath(ThisExtension.rootUri, 'resources', theme, 'workspace', 'file' + sync_state + '.png');
	}

	get _command(): vscode.Command {
		
		// vscode.open only works if the local file exists and it is not a notebook (which would get opened as JSON)
		if (this.localPathExists) {
			return {
				command: 'vscode.open',
				title: 'Open',
				arguments: [
					this.localPath,
					<vscode.TextDocumentShowOptions>{
						preserveFocus: true
					}
				]
			}
		}
		return {
			command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
		}
	};

	get localFolderPath(): vscode.Uri {
		return FSHelper.parent(FSHelper.joinPathSync(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.SubfolderConfiguration().Workspace, this.path));
	}

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceFile {
		return new DatabricksWorkspaceFile(item.path, item.object_id, parent);
	}

	public static fromJSON(jsonString: string, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceFile {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceFile.fromInterface(item, parent);
	}

	async download(): Promise<vscode.Uri> {
		try {
			let localPath: vscode.Uri;
			//vscode.window.showInformationMessage(`Download of item ${this._path}) started ...`);
			if(this.localPathExists)
			{
				localPath = this.localPath;
			}
			else
			{
				localPath = await FSHelper.joinPath(this.localFolderPath, this.label.toString());
			}

			await vscode.workspace.fs.writeFile( localPath, await DatabricksApiService.downloadWorkspaceFile(this.path));
			this._localPath = localPath;

			Helper.showTemporaryInformationMessage(`Download of item ${FSHelper.basename(localPath)} finished!`);

			if (ThisExtension.RefreshAfterUpDownload) {
				setTimeout(() => this.refreshParent(), 500);
			}

			return localPath;
		}
		catch (error) {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		}
	}

	async upload(): Promise<void> {
		try {
			let response = await DatabricksApiService.uploadWorkspaceFile(this.path, await vscode.workspace.fs.readFile(this.localPath));
			Helper.showTemporaryInformationMessage(`Upload of item ${this.path}) finished!`);

			if (ThisExtension.RefreshAfterUpDownload) {
				setTimeout(() => this.refreshParent(), 500);
			}
		}
		catch (error) {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		}
	}

	async click(): Promise<void> {
		this.open()
	}

	async doubleClick(): Promise<void> {
		//vscode.window.showInformationMessage("DoubleClick");
		this.open();
	}

	async open(showWarning: boolean = true): Promise<void> {
		if (!this.localPathExists) {
			await this.download();
		}
		else {
			if (showWarning)
				vscode.window.showWarningMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!");
		}
		let viewType: string = "default";

		await vscode.commands.executeCommand('vscode.openWith', this.localPath, viewType);
	}

	async compare(): Promise<void> {
		let onlineFileTempPath: vscode.Uri = vscode.Uri.parse(ThisExtension.WORKSPACE_SCHEME + ":" + this.path);

		Helper.showDiff(onlineFileTempPath, this.localPath);
	}

	async delete(): Promise<void> {
		let options: string[] = ["Cancel"];

		if (this.onlinePathExists) {
			options.push("Delete on Databricks only")
		}
		if (this.localPathExists) {
			options.push("Delete locally only")

			if (this.onlinePathExists) {
				options.push("Delete on Databricks and locally")
			}
		}

		let confirm = await Helper.showQuickPick(options, `Which files do you want to delete?`)

		if (!confirm || confirm == "Cancel") {
			ThisExtension.log("Deletion of Workspace notebook '" + this.path + "' aborted!")
			return;
		}

		if (confirm.includes("locally")) {
			ThisExtension.log(`Deleting local file '${this.localPath}'!`);
			await vscode.workspace.fs.delete(this.localPath, { recursive: true });
		}
		if (confirm.includes("Databricks")) {
			ThisExtension.log(`Deleting Databricks file '${this.path}'!`);
			await DatabricksApiService.deleteWorkspaceItem(this.path, false);
		}

		// we always call refresh
		setTimeout(() => this.refreshParent(), 500);
	}
}