import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { Helper } from '../../../helpers/Helper';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSFile } from './DatabricksFSFile';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSDirectory extends DatabricksFSTreeItem {

	protected _isInitialized: boolean = false;
	private _onlinePathExists: boolean = true;
	
	constructor(
		path: string,
		parent: DatabricksFSDirectory,
		source: "Online" | "Local"
	) {
		super(path, true, 0, parent, vscode.TreeItemCollapsibleState.Collapsed);
		
		if (source == "Local") {
			this._onlinePathExists = false;
		}

		// all properties from super are evaluated BEFORE already (1st line) and may return wrong results if if not all 
		// values of this had been initialized before
		this._isInitialized = true;

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

		tooltip += "Local Path: " + this.localPath + "\n";

		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		return this.path;
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get _contextValue(): string {
		return 'FOLDER';
	}

	get localPath(): string {
		return fspath.join(
			ThisExtension.ActiveConnection.localSyncFolder, 
			ThisExtension.ActiveConnection.DatabricksFSSubFolder, 
			this.path);
	}

	get localPathExists(): boolean {
		return fs.existsSync(this.localPath);
	}

	get localFileUri(): vscode.Uri {
		// three '/' in the beginning indicate a local path
		// however, there are issues if this.localFilePath also starts with a '/' so we do a replace in this special case
		return vscode.Uri.parse(("file:///" + this.localPath).replace('////', '///'));
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	public static fromInterface(item: iDatabricksFSItem, parent: DatabricksFSDirectory): DatabricksFSDirectory {
		return new DatabricksFSDirectory(item.path, parent, "Online");
	}


	async getChildren(): Promise<DatabricksFSTreeItem[]> {
		let onlineItems: DatabricksFSTreeItem[] = [];
		if (this.onlinePathExists) {
			let webServiceItems: iDatabricksFSItem[] = await DatabricksApiService.listDBFSItems(this.path);

			if (webServiceItems != undefined) {
				for (let item of webServiceItems) {
					if (item.is_dir) {
						onlineItems.push(DatabricksFSDirectory.fromInterface(item, this));
					}
					else
					{
						onlineItems.push(DatabricksFSFile.fromInterface(item, this));
					}
				}
			}
		}

		let localItems: DatabricksFSTreeItem[] = [];
		if (this.localPathExists) {
			// TODO browse local directory for files
		}

		let allItems = onlineItems.concat(localItems);
		Helper.sortArrayByProperty(allItems, "label", "ASC");

		return allItems;
	}

	async add(): Promise<void> {
		let files: vscode.Uri[] = await vscode.window.showOpenDialog({ canSelectMany: true });

		if(!files)
		{
			return;
		}

		for(let file of files)
		{
			let dbfsPath = fspath.join(this.path, fspath.basename(file.fsPath)).split('\\').join('/');
			let response = DatabricksApiService.uploadDBFSFile(file.fsPath, dbfsPath, true );

			response.catch((error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}).then(() => {
				Helper.showTemporaryInformationMessage(`Upload of item ${dbfsPath} finished!`);

				if(ThisExtension.RefreshAfterUpDownload)
				{
					setTimeout(() => this.refreshParent(), 500);
				}
			});
		}
	}

	async upload(): Promise<void> {
		vscode.window.showErrorMessage("[Upload] is currently not supported on directories.");
		return;
	}

	async download(): Promise<void> {
		vscode.window.showErrorMessage("[Download] is currently not supported on directories.");
		return;
	}

	async delete(): Promise<void> {
		vscode.window.showErrorMessage("For safety reasons, only a single file can be deleted!");
		return;
	}
}