import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { Helper } from '../../../helpers/Helper';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSFile extends DatabricksFSTreeItem {

	protected _isInitialized: boolean = false;
	private _onlinePathExists: boolean = true;

	constructor(
		path: string,
		size: number,
		parent: DatabricksFSDirectory,
		source: "Online" | "Local"
	) {
		super(path, false, size, parent, vscode.TreeItemCollapsibleState.None);

		if (source == "Local") {
			this._onlinePathExists = false;
		}

		super.label = path.split('/').pop();
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get _tooltip(): string {
		let tooltip: string = "Path: " + this.path + "\n";

		if (!this.localPathExists) {
			tooltip += "Local Path: [not yet downloaded] " + this.localFilePath + "\n";
		}
		else {
			tooltip += "Local Path: [downloaded] " + this.localFilePath + "\n";
		}

		tooltip += `Size: ${Helper.bytesToSize(this.file_size)}`;

		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		return `${this.path} (${Helper.bytesToSize(this.file_size)})`;
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get _contextValue(): string {
		if (this.localPathExists) {
			return 'FILE_WITH_LOCAL_COPY';
		}
		else {
			return 'FILE';
		}
	}

	readonly command = {
		command: 'databricksFSItem.click', title: "Open File", arguments: [this]
	};

	get localFolderPath(): string {
		return fspath.join(
			ThisExtension.ActiveConnection.localSyncFolder,
			ThisExtension.ActiveConnection.DatabricksFSSubFolder,
			fspath.dirname(this.path));
	}

	get localFilePath(): string {
		return fspath.join(
			ThisExtension.ActiveConnection.localSyncFolder,
			ThisExtension.ActiveConnection.DatabricksFSSubFolder,
			this.path);
	}

	get localFileName(): string {
		return this.label.toString();
	}

	get localPathExists(): boolean {
		return fs.existsSync(this.localFilePath);
	}

	get localFileUri(): vscode.Uri {
		// three '/' in the beginning indicate a local path
		// however, there are issues if this.localFilePath also starts with a '/' so we do a replace in this special case
		return vscode.Uri.parse(("file:///" + this.localFilePath).replace('////', '///'));
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	get localFileExtension(): string {
		return fspath.extname(this.path);
	}

	public static fromInterface(item: iDatabricksFSItem, parent: DatabricksFSDirectory): DatabricksFSFile {
		return new DatabricksFSFile(item.path, item.file_size, parent, "Online");
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
				vscode.window.showWarningMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!");
		}

		vscode.workspace
			.openTextDocument(this.localFileUri)
			.then(vscode.window.showTextDocument);
	}

	async download(asTempFile: boolean = false): Promise<string> {
		try {
			//vscode.window.showInformationMessage(`Download of item ${this._path}) started ...`);
			let localPath = this.localFilePath;
			if (asTempFile) {
				localPath = await Helper.openTempFile('', this.label + '-ONLINE', false);
				localPath += this.localFileExtension;
			}

			let response = await DatabricksApiService.downloadDBFSFile(this.path, localPath, true);

			vscode.window.showInformationMessage(`Download of item ${this.path} finished!`);

			if (ThisExtension.RefreshAfterUpDownload && !asTempFile) {
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
			let localFilePath = fspath.join(
				ThisExtension.ActiveConnection.localSyncFolder,
				ThisExtension.ActiveConnection.DatabricksFSSubFolder,
				this.path
			);
			let response = DatabricksApiService.uploadDBFSFile(localFilePath, this.path, true);
			vscode.window.showInformationMessage(`Upload of item ${this.path}) finished!`);
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

		if(!confirm || confirm == "Cancel")
		{
			ThisExtension.log("Deletion of DBFS file '" + this.path + "' aborted!")
			return;
		}

		if (confirm.includes("local")) {
			ThisExtension.log(`Deleting local file '${this.localFilePath}'!`);
			fs.unlink(this.localFilePath, (err) => { if (err) { vscode.window.showErrorMessage(err.message); } });
		}
		if (confirm.includes("DBFS")) {
			DatabricksApiService.deleteDBFSItem(this.path, false);	
		}

		// we always call refresh
		setTimeout(() => this.refreshParent(), 500);
	}

	async compare(): Promise<void> {
		let onlineFileTempPath: string = await this.download(true);

		// if(this._languageFileExtension.isNotebook) { await Helper.disableOpenAsNotebook(); }
		Helper.showDiff(onlineFileTempPath, this.localFilePath);
	}
}