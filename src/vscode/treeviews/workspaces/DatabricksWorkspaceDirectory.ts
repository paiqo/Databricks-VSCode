import * as vscode from 'vscode';

import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { LanguageFileExtensionMapper } from './LanguageFileExtensionMapper';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceLibrary } from './DatabricksWorkspaceLibrary';
import { DatabricksWorkspaceNotebook } from './DatabricksWorkspaceNotebook';

import { DatabricksWorkspaceFile } from './DatabricksWorkspaceFile';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceDirectory extends DatabricksWorkspaceTreeItem {

	private _onlinePathExists: boolean = true;
	private _localPath: vscode.Uri = undefined;
	private _isInitialized: boolean = false;

	constructor(
		path: string,
		object_id: number,
		source: "Online" | "Local",
		local_path?: vscode.Uri,
		parent: DatabricksWorkspaceTreeItem = undefined
	) {
		super(path, "DIRECTORY", object_id, parent, vscode.TreeItemCollapsibleState.Collapsed);

		this._localPath = local_path;
		this._onlinePathExists = source != "Local";

		this._isInitialized = true;

		this.init();
	}

	init(): void {
		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if(this._isInitialized)
		{
			super.label = this.path.split('/').pop();
			super.tooltip = this._tooltip;
			super.contextValue = this._contextValue;
			super.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			};
		}
	}

	get _tooltip(): string {
		let tooltip: string = this.path + "\n";

		if (this.onlinePathExists && !this.localPathExists) {
			tooltip += "[Online only]\n";
		}
		if (!this.onlinePathExists && this.localPathExists) {
			tooltip += "[Offline only]\n";
		}
		if (this.onlinePathExists && this.localPathExists) {
			tooltip += "[Synced]\n";
		}
		return tooltip;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		let states: string[] = [];

		if (this.localPathExists) {
			states.push("UPLOAD");
		}
		if (this.onlinePathExists) {
			states.push("DOWNLOAD")
		}

		// use , as separator to allow to check for ,<value>, in package.json when condition
		return "," + states.join(",") + ",";
	}

	protected getIconPath(theme: string): vscode.Uri {
		let sync_state: string = "";

		if (this.localPathExists && !this.onlinePathExists) { sync_state = "_OFFLINE"; }
		if (!this.localPathExists && this.onlinePathExists) { sync_state = "_ONLINE"; }

		return vscode.Uri.joinPath(ThisExtension.rootUri, 'resources', theme, 'workspace', 'directory' + sync_state + '.png');
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

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceDirectory {
		return new DatabricksWorkspaceDirectory(item.path, item.object_id, "Online", null, parent);
	}

	public static fromJSON(jsonString: string, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceDirectory {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceDirectory.fromInterface(item, parent);
	}

	async getChildren(): Promise<DatabricksWorkspaceTreeItem[]> {
		let onlineItems: DatabricksWorkspaceTreeItem[] = [];
		if (this.onlinePathExists) {
			let webServiceItems: iDatabricksWorkspaceItem[] = await DatabricksApiService.listWorkspaceItems(this.path);

			if (webServiceItems != undefined) {
				for (let item of webServiceItems) {
					switch (item.object_type) {
						case "LIBRARY":
							onlineItems.push(DatabricksWorkspaceLibrary.fromInterface(item, this));
							break;
						case "NOTEBOOK":
							onlineItems.push(DatabricksWorkspaceNotebook.fromInterface(item, this));
							break;
						case "FILE":
							onlineItems.push(DatabricksWorkspaceFile.fromInterface(item, this));
							break;
						case "DIRECTORY":
						case "REPO":
							onlineItems.push(DatabricksWorkspaceDirectory.fromInterface(item, this));
							break;
					}
				}
			}
		}
		let onlinePaths: string[] = onlineItems.map((x) => (x as iDatabricksWorkspaceItem).path);

		let localItems: DatabricksWorkspaceTreeItem[] = [];
		if (this.localPathExists) {
			let localContent: [string, vscode.FileType][] = await vscode.workspace.fs.readDirectory(this.localPath);

			for (let local of localContent) {
				let localUri: vscode.Uri = vscode.Uri.joinPath(this.localPath, local[0]);
				//let localFile: fspath.ParsedPath = fspath.parse(local);
				let localFullPath = FSHelper.joinPath(this.localPath, local[0]);
				let shownLocalFile = Helper.getToken(localUri.path, '/', -1);
				if (local[1] == vscode.FileType.File) // remove extension
				{
					shownLocalFile = shownLocalFile.replace(shownLocalFile.split('.')[-1], '');
				}
				let localRelativePath = (this.path + '/' + shownLocalFile).replace('//', '/');

				if (!onlinePaths.includes(localRelativePath)) {
					let languageFileExtension: LanguageFileExtensionMapper = undefined;

					if (local[1] == vscode.FileType.File) {
						let ext = LanguageFileExtensionMapper.extensionFromFileName(Helper.getToken(localUri.path, "/", -1));

						if (LanguageFileExtensionMapper.supportedFileExtensions.includes(ext)
							|| ThisExtension.allFileExtensions.includes(ext)) {
							languageFileExtension = LanguageFileExtensionMapper.fromFileName(Helper.getToken(localUri.path, "/", -1));
						}
						else {
							vscode.window.showWarningMessage("File " + localFullPath + " has no valid extension and will be ignored! Supported extensions can be confiugred using setting 'exportFormats'.");
							continue;
						}
						localItems.push(new DatabricksWorkspaceNotebook(localRelativePath, -1, "Local", languageFileExtension, localUri, this));
					}
					else {
						localItems.push(new DatabricksWorkspaceDirectory(localRelativePath, -1, "Local", localUri, this));
					}
				}
				else {
					for(let existingItem of onlineItems)
					{
						if(existingItem.path == localRelativePath)
						{
							(existingItem as DatabricksWorkspaceDirectory).localPath = localUri;
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

	async download(): Promise<void> {
		FSHelper.ensureFolder(this.localPath);
		let items: iDatabricksWorkspaceItem[] = await this.getChildren();

		for (let item of items) {
			switch (item.object_type) {
				case "NOTEBOOK":
					DatabricksWorkspaceNotebook.fromInterface(item).download();
					break;
				case "DIRECTORY":
				case "REPO":
					DatabricksWorkspaceDirectory.fromInterface(item).download();
					break;
			}
		}

		setTimeout(() => this.refreshParent(), 500);
	}

	async upload(): Promise<void> {
		DatabricksApiService.createWorkspaceFolder(this.path);
		let items: iDatabricksWorkspaceItem[] = await this.getChildren();

		for (let item of items) {
			switch (item.object_type) {
				case "NOTEBOOK":
					DatabricksWorkspaceNotebook.fromInterface(item).upload();
					break;
				case "DIRECTORY":
				case "REPO":
					DatabricksWorkspaceDirectory.fromInterface(item).upload();
					break;
			}
		}

		setTimeout(() => this.refreshParent(), 500);
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

		let confirm = await Helper.showQuickPick(options, `Which locations do you want to delete?`)

		if (!confirm || confirm == "Cancel") {
			ThisExtension.log("Deletion of Workspace directory '" + this.path + "' aborted!")
			return;
		}

		if (confirm.includes("locally")) {
			ThisExtension.log(`Deleting local directory '${this.localPath}'!`);
			await vscode.workspace.fs.delete(this.localPath, { recursive: true });
		}
		if (confirm.includes("Databricks")) {
			ThisExtension.log(`Deleting Databricks directory '${this.path}'!`);
			DatabricksApiService.deleteWorkspaceItem(this.path, true);
		}

		// we always call refresh
		setTimeout(() => this.refreshParent(), 500);
	}
}