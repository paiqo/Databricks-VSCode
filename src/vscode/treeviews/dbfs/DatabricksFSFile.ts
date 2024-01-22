import * as vscode from 'vscode';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { iDatabricksFSItem } from './iDatabricksFSItem';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSFile extends DatabricksFSTreeItem {

	private _onlinePathExists: boolean = true;
	private _localPath: vscode.Uri = undefined;
	private _localStats: vscode.FileStat;
	protected _isInitialized: boolean = false;

	constructor(
		path: string,
		size: number,
		source: "Online" | "Local",
		local_path?: vscode.Uri,
		parent: DatabricksFSDirectory = undefined
	) {
		super(path, false, size, 0, parent, vscode.TreeItemCollapsibleState.None);

		this._localPath = local_path;
		this._onlinePathExists = source != "Local";

		this._isInitialized = true;

		this.init();
	}

	async init(): Promise<void> {
		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if (this._isInitialized) {
			super.label = Helper.getToken(this.path, '/', -1);
			super.tooltip = this._tooltip;
			super.description = this._description;
			super.contextValue = this._contextValue;
			super.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			}
		}
	}

	get _tooltip(): string {
		let tooltip: string = "";
		if (this.onlinePathExists) {
			tooltip = `DBFS: ${this.path}\n (${Helper.bytesToSize(this.file_size)})`;
		}
		else 
		{
			tooltip += "DBFS: [not yet uploaded]\n";
		}

		if (this.localPathExists) {

			tooltip += `Local: ${this.localPath.fsPath}\n`;
		}
		else {
			tooltip += "Local: [not yet downloaded]\n";
		}

		return tooltip.trim();
	}

	// description is show next to the label
	get _description(): string {
		if (this.onlinePathExists)
		{
			return `${this.path} (${Helper.bytesToSize(this.file_size)})`;
		}
		return this.path;
	}

	// used in package.json to filter commands via viewItem =~ /.*,DOWNLOAD,.*/",
	get _contextValue(): string {
		let states: string[] = ["FILE"];

		if (this.localPathExists && ThisExtension.ConnectionManager.SubfolderConfiguration().DBFS) {
			states.push("UPLOAD");
		}
		if (this.onlinePathExists && ThisExtension.ConnectionManager.SubfolderConfiguration().DBFS) {
			states.push("DOWNLOAD")
		}
		if (this.localPathExists || this.onlinePathExists) {
			states.push("DELETE")
		}

		// use , as separator to allow to check for ,<value>, in package.json when condition
		return "," + states.join(",") + ",";
	}

	readonly command = {
		command: 'databricksFSItem.click', title: "Open File", arguments: [this]
	};

	get localPath(): vscode.Uri {
		return this._localPath
	}

	set localPath(value: vscode.Uri) {
		this._localPath = value;
	}

	get localFileName(): string {
		return this.label.toString();
	}

	get localPathExists(): boolean {
		if (this.localPath) {
			return true;
		}
		return false;
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	get localFileExtension(): string {
		return this.localPath.path.split('.').slice(-1, -1)[0];
	}

	public static fromInterface(item: iDatabricksFSItem, parent: DatabricksFSDirectory): DatabricksFSFile {
		return new DatabricksFSFile(item.path, item.file_size, "Online", null, parent);
	}

	async click(): Promise<void> {
		this.open();
	}

	async open(showWarning: boolean = true): Promise<void> {
		if (!this.localPathExists) {
			await this.download();
		}
		else {
			if (showWarning)
				Helper.showTemporaryInformationMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!", 8000);
		}

		vscode.workspace
			.openTextDocument(this.localPath)
			.then(vscode.window.showTextDocument);
	}

	async download(): Promise<vscode.Uri> {
		try {
			//vscode.window.showInformationMessage(`Download of item ${this._path}) started ...`);
			let localPath: vscode.Uri;

			if (this.localPathExists) {
				localPath = this.localPath;
			}
			else {
				localPath = vscode.Uri.joinPath(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.SubfolderConfiguration().DBFS, this.path);
			}

			await DatabricksApiService.downloadDBFSFile(this.path, localPath, true);
			this._localPath = localPath;

			Helper.showTemporaryInformationMessage(`Download of DBFS item ${this.path} to '${localPath}' finished!`);

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
			await DatabricksApiService.uploadDBFSFile(this.localPath, this.path, true);
			
			Helper.showTemporaryInformationMessage(`Upload of item ${this.path}) finished!`);

			if (ThisExtension.RefreshAfterUpDownload) {
				setTimeout(() => this.refreshParent(), 500);
			}
		}
		catch (error) {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		}
	}

	async delete(): Promise<void> {
		let options: string[] = ["Cancel", "Delete DBFS file only"];

		if (this.localPathExists) {
			options.push("Delete local file only")
			options.push("Delete file on DBFS and locally")
		}

		let confirm = await Helper.showQuickPick(options, `Which files do you want to delete?`)

		if (!confirm || confirm == "Cancel") {
			ThisExtension.log("Deletion of DBFS file '" + this.path + "' aborted!")
			return;
		}

		if (confirm.includes("local")) {
			ThisExtension.log(`Deleting local file '${this.localPath}'!`);
			await vscode.workspace.fs.delete(this.localPath, { recursive: true });
		}
		if (confirm.includes("DBFS")) {
			await DatabricksApiService.deleteDBFSItem(this.path, false);
		}

		// we always call refresh
		setTimeout(() => this.refreshParent(), 500);
	}

	async compare(): Promise<void> {
		Helper.showDiff(vscode.Uri.parse(ThisExtension.DBFS_SCHEME + ":/" + this.path), this.localPath);
	}
}