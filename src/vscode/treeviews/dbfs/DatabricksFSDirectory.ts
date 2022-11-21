import * as vscode from 'vscode';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { Helper } from '../../../helpers/Helper';
import { DatabricksFSTreeItem } from './DatabricksFSTreeItem';
import { DatabricksFSFile } from './DatabricksFSFile';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSDirectory extends DatabricksFSTreeItem {

	private _onlinePathExists: boolean = true;
	private _localPath: vscode.Uri = undefined;
	protected _isInitialized: boolean = false;

	constructor(
		path: string,
		source: "Online" | "Local",
		local_path?: vscode.Uri,
		parent: DatabricksFSDirectory = undefined
	) {
		super(path, true, 0, 0, parent, vscode.TreeItemCollapsibleState.Collapsed);

		this._localPath = local_path;
		this._onlinePathExists = source != "Local";

		this._isInitialized = true;

		this.init();
	}

	async init(): Promise<void> {
		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if (this._isInitialized) {
			super.label = this.path.split('/').pop();
			super.tooltip = this._tooltip;
			super.description = this._description;
			super.contextValue = this._contextValue;
			super.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			};
		}
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
	// used in package.json to filter commands via viewItem =~ /.*,DOWNLOAD,.*/",
	get _contextValue(): string {
		let states: string[] = ["FOLDER", "ADDFILE", "ADDDIRECTORY", "DELETE"];

		// use , as separator to allow to check for ,<value>, in package.json when condition
		return "," + states.join(",") + ",";
	}

	get localPath(): vscode.Uri {
		return this._localPath;
	}

	set localPath(value: vscode.Uri) {
		this._localPath = value;
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

	public static fromInterface(item: iDatabricksFSItem, parent: DatabricksFSDirectory): DatabricksFSDirectory {
		return new DatabricksFSDirectory(item.path, "Online", null, parent);
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
					else {
						onlineItems.push(DatabricksFSFile.fromInterface(item, this));
					}
				}
			}
		}

		let onlinePaths: string[] = onlineItems.map((x) => (x as iDatabricksFSItem).path);

		let localItems: DatabricksFSTreeItem[] = [];
		if (this.localPathExists) {
			let localContent: [string, vscode.FileType][] = await vscode.workspace.fs.readDirectory(this.localPath);

			for (let local of localContent) {
				let localUri: vscode.Uri = vscode.Uri.joinPath(this.localPath, local[0]);

				let localRelativePath = FSHelper.join(this.path, local[0]);


				if (!onlinePaths.includes(localRelativePath)) {
					switch (local[1]) // remove extension
					{
						case vscode.FileType.File:
							localItems.push(new DatabricksFSFile(localRelativePath, -1, "Local", localUri, this));
							break;
						case vscode.FileType.Directory:
							localItems.push(new DatabricksFSDirectory(localRelativePath, "Local", localUri, this));
							break;
					}

				}
				else {
					for (let existingItem of onlineItems) {
						if (existingItem.path == localRelativePath) {
							(existingItem as DatabricksFSFile).localPath = localUri;
							existingItem.init();
							break;
						}
					}
				}
			}
		}

		let allItems = onlineItems.concat(localItems);
		Helper.sortArrayByProperty(allItems, "label", "ASC");

		return allItems;
	}

	async addFile(): Promise<void> {
		let files: vscode.Uri[] = await vscode.window.showOpenDialog({ canSelectMany: true });

		if (!files) {
			return;
		}

		for (let file of files) {
			let dbfsPath = FSHelper.join(this.path, FSHelper.basename(file));
			let response = DatabricksApiService.uploadDBFSFile(file, dbfsPath, true);

			response.catch((error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}).then(() => {
				Helper.showTemporaryInformationMessage(`Upload of item ${dbfsPath} finished!`);

				if (ThisExtension.RefreshAfterUpDownload) {
					setTimeout(() => this.refreshParent(), 500);
				}
			});
		}
	}

	async addDirectory(): Promise<void> {
		let newName = await Helper.showInputBox("<new directory>", "Name of the new Directory", true);
		if (!newName) {
			ThisExtension.log("Adding DBFS directory aborted!");
			return;
		}

		vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(this.dbfsUri, newName));

		if (ThisExtension.RefreshAfterUpDownload) {
			setTimeout(() => this.refreshParent(), 500);
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
		let confirm: string = await Helper.showInputBox("", "Confirm deletion by typeing the directory name '" + this.label + "' again.", true);
		if (!confirm) {
			ThisExtension.log("Deletion of DBFS directory '" + this.label + "' aborted!")
			return;
		}
		if(confirm != this.label)
		{
			ThisExtension.log("Deletion of DBFS directory '" + this.label + "' aborted due to wrong confirmation '" + confirm + "'");
			vscode.window.showErrorMessage(`Deletion NOT confirmed!\n('${this.label}' != '${confirm}')`);
			return;
		}

		await vscode.workspace.fs.delete(this.dbfsUri);

		if (ThisExtension.RefreshAfterUpDownload) {
			setTimeout(() => this.refreshParent(), 500);
		}
	}
}