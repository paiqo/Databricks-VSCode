import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';

import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../ThisExtension';
import { DatabricksApiService } from '../databricksApiService';
import { Helper } from '../../helpers/Helper';
import { LanguageFileExtensionMapper } from './LanguageFileExtensionMapper';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceLibrary } from './DatabricksWorkspaceLibrary';
import { DatabricksWorkspaceNotebook } from './DatabricksWorkspaceNotebook';
import { DatabricksConnectionManager } from '../../connections/DatabricksConnectionManager';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceDirectory extends DatabricksWorkspaceTreeItem {

	protected _isInitialized: boolean = false;
	private _onlinePathExists: boolean = true;

	constructor(
		path: string,
		object_id: number,
		source: "Online" | "Local",
	) {
		super(path, "DIRECTORY", object_id, undefined, vscode.TreeItemCollapsibleState.Collapsed);

		this._object_type = "DIRECTORY";

		if (source == "Local") {
			this._onlinePathExists = false;
		}

		// all properties from super are evaluated BEFORE already (1st line) and may return wrong results if if not all 
		// values of this had been initialized before
		this._isInitialized = true;

		super.label = path.split('/').pop();
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}


	get tooltip(): string {
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
	get contextValue(): string {
		return 'CAN_SYNC';
	}

	protected getIconPath(theme: string): string {
		if (!this._isInitialized) { return null; }

		let sync_state: string = "";

		if (this.localPathExists && !this.onlinePathExists) { sync_state = "_OFFLINE"; }
		if (!this.localPathExists && this.onlinePathExists) { sync_state = "_ONLINE"; }

		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'directory' + sync_state + '.png');
	}

	get localPath(): string {
		return fspath.join(ThisExtension.ActiveConnection.localSyncFolder, DatabricksConnectionManager.WorkspaceSubFolder, this.path);
	}

	get localPathExists(): boolean {
		return fs.existsSync(this.localPath);
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	public static fromInterface(item: iDatabricksWorkspaceItem): DatabricksWorkspaceDirectory {
		return new DatabricksWorkspaceDirectory(item.path, item.object_id, "Online");
	}

	public static fromJSON(jsonString: string): DatabricksWorkspaceDirectory {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceDirectory.fromInterface(item);
	}

	async getChildren(): Promise<DatabricksWorkspaceTreeItem[]> {
		let onlineItems: DatabricksWorkspaceTreeItem[] = [];
		if (this.onlinePathExists) {
			let webServiceItems: iDatabricksWorkspaceItem[] = await DatabricksApiService.listWorkspaceItems(this.path);

			if (webServiceItems != undefined) {
				for (let item of webServiceItems) {
					switch (item.object_type) {
						case "LIBRARY":
							onlineItems.push(DatabricksWorkspaceLibrary.fromInterface(item));
							break;
						case "NOTEBOOK":
							onlineItems.push(DatabricksWorkspaceNotebook.fromInterface(item));
							break;
						case "DIRECTORY":
							onlineItems.push(DatabricksWorkspaceDirectory.fromInterface(item));
							break;
					}
				}
			}
		}
		let onlinePaths: string[] = onlineItems.map((x) => (x as iDatabricksWorkspaceItem).path);

		let localItems: DatabricksWorkspaceTreeItem[] = [];
		if (this.localPathExists) {
			let localContent: string[] = fs.readdirSync(this.localPath);

			for (let local of localContent) {
				let localFile: fspath.ParsedPath = fspath.parse(local);
				let localRelativePath = (this.path + '/'
					+ localFile.base.replace(LanguageFileExtensionMapper.extensionFromFileName(localFile.base), '')) // remove extension
					.replace('//', '/');
				let localFullPath = fspath.join(this.localPath, local);

				if (!onlinePaths.includes(localRelativePath)) {
					let languageFileExtension: LanguageFileExtensionMapper = undefined;

					if (fs.lstatSync(localFullPath).isFile()) {
						let ext = LanguageFileExtensionMapper.extensionFromFileName(localFile.base);

						if (LanguageFileExtensionMapper.supportedFileExtensions.includes(ext)
							|| (ThisExtension.ActiveConnection.allowAllSupportedFileExtensions && ThisExtension.allFileExtensions.includes(ext))) {
							languageFileExtension = LanguageFileExtensionMapper.fromFileName(localFile.base);
						}
						else {
							vscode.window.showWarningMessage("File " + localFullPath + " has no valid extension and will be ignored! Supported extensions can be confiugred using setting 'exportFormats'.");
							continue;
						}
						localItems.push(new DatabricksWorkspaceNotebook(localRelativePath, -1, "Local", languageFileExtension));
					}
					else {
						localItems.push(new DatabricksWorkspaceDirectory(localRelativePath, -1, "Local"));
					}
				}
			}
		}

		let allItems = onlineItems.concat(localItems);
		Helper.sortArrayByProperty(allItems, "label", "ASC");

		return allItems;
	}

	async download(): Promise<void> {
		Helper.ensureLocalFolder(this.localPath);
		let items: iDatabricksWorkspaceItem[] = await this.getChildren();

		for (let item of items) {
			switch (item.object_type) {
				case "NOTEBOOK":
					DatabricksWorkspaceNotebook.fromInterface(item).download();
					break;
				case "DIRECTORY":
					DatabricksWorkspaceDirectory.fromInterface(item).download();
					break;
			}
		}
	}

	async upload(): Promise<void> {
		DatabricksApiService.createWorkspaceFolder(this.localPath);
		let items: iDatabricksWorkspaceItem[] = await this.getChildren();

		for (let item of items) {
			switch (item.object_type) {
				case "NOTEBOOK":
					DatabricksWorkspaceNotebook.fromInterface(item).upload();
					break;
				case "DIRECTORY":
					DatabricksWorkspaceDirectory.fromInterface(item).upload();
					break;
			}
		}
	}
}