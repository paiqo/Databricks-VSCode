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

	constructor(
		path: string,
		object_id: number,
		local_path?: vscode.Uri,
		parent: DatabricksWorkspaceTreeItem = undefined
	) {
		super(path, "DIRECTORY", object_id, parent, local_path, vscode.TreeItemCollapsibleState.Collapsed);

		this._isInitialized = true;

		this.init();
	}

	async init(): Promise<void> {
		super.init();

		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if (this._isInitialized) {
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

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceDirectory {
		return new DatabricksWorkspaceDirectory(item.path, item.object_id, null, parent);
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
				let localUri: vscode.Uri = await FSHelper.joinPath(this.localPath, local[0]);
				let shownLocalFile = FSHelper.basename(localUri);
				let origianalLocalFile = shownLocalFile;

				if (local[1] == vscode.FileType.File) // remove extension
				{
					shownLocalFile = FSHelper.basename(FSHelper.removeExtension(localUri));
				}
				let shownLocalRelativePath = FSHelper.join(this.path, shownLocalFile);
				let originalLocalRelativePath = FSHelper.join(this.path, origianalLocalFile);

				if (!onlinePaths.includes(shownLocalRelativePath) && !onlinePaths.includes(originalLocalRelativePath)) {
					let languageFileExtension: LanguageFileExtensionMapper = undefined;

					if (local[1] == vscode.FileType.File) {
						if(localUri.path.includes("/Repos/"))
						{
							// TODO: special case for Repos where also regular files are supported!
						}
						let ext = LanguageFileExtensionMapper.extensionFromFileName(FSHelper.basename(localUri));

						if (LanguageFileExtensionMapper.supportedFileExtensions.includes(ext)
							|| ThisExtension.allFileExtensions.includes(ext)) {
							languageFileExtension = LanguageFileExtensionMapper.fromFileName(FSHelper.basename(localUri));
						}
						else {
							vscode.window.showWarningMessage("File " + localUri + " has no valid extension and will be ignored! Supported extensions can be confiugred using setting 'exportFormats'.");
							continue;
						}
						localItems.push(new DatabricksWorkspaceNotebook(shownLocalRelativePath, -1, languageFileExtension, localUri, this));
					}
					else {
						localItems.push(new DatabricksWorkspaceDirectory(shownLocalRelativePath, -1, localUri, this));
					}
				}
				else {
					for (let existingItem of onlineItems) {
						if (existingItem.path == shownLocalRelativePath) {
							existingItem.localPath = localUri;
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

	async download(refreshParent: boolean = true): Promise<void> {
		if(!this.localPath) // if we try to download a subfolder of a folder that has not yet been synced this.localPath is not populated!
		{
			this.localPath = vscode.Uri.joinPath(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ConnectionManager.SubfolderConfiguration().Workspace, this.path);
		}
		FSHelper.ensureFolder(this.localPath);
		let items: DatabricksWorkspaceTreeItem[] = await this.getChildren() as DatabricksWorkspaceTreeItem[];

		for (let item of items) {
			if (item.onlinePathExists) // we can only download items that exist online
			{
				switch (item.object_type) {
					case "NOTEBOOK":
						let nb = DatabricksWorkspaceNotebook.fromInterface(item, this);

						nb.localPath = await FSHelper.joinPath(this.localPath, nb.label + nb.localFileExtension);
						await nb.download(false);
						break;
					case "DIRECTORY":
					case "REPO":
						let dir = DatabricksWorkspaceDirectory.fromInterface(item, this);

						dir.localPath = await FSHelper.joinPath(this.localPath, dir.label.toString());
						await dir.download(false);

						break;
				}
			}
		}

		if (ThisExtension.RefreshAfterUpDownload && refreshParent) {
			setTimeout(() => this.refreshParent(), 500);
		}
	}

	async upload(): Promise<void> {
		DatabricksApiService.createWorkspaceFolder(this.path);
		let items: DatabricksWorkspaceTreeItem[] = await this.getChildren() as DatabricksWorkspaceTreeItem[];

		for (let item of items) {
			if (item.localPathExists) // we can only upload files that exist locally
			{
				switch (item.object_type) {
					case "NOTEBOOK":
						let nb = DatabricksWorkspaceNotebook.fromInterface(item);

						nb.localPath = await FSHelper.joinPath(this.localPath, nb.label + nb.localFileExtension);
						await nb.upload();
						
						break;
					case "DIRECTORY":
					case "REPO":
						let dir = DatabricksWorkspaceDirectory.fromInterface(item);

						dir.localPath = await FSHelper.joinPath(this.localPath, dir.label.toString());
						await dir.upload();

						break;
				}
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