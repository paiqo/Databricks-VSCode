import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';

import { WorkspaceItemExportFormat, WorkspaceItemLanguage, WorkspaceItemType } from './_types';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../ThisExtension';
import { DatabricksApiService } from '../databricksApiService';
import { ActiveDatabricksEnvironment } from './../../environments/ActiveDatabricksEnvironment';
import { Helper } from '../../helpers/Helper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceTreeItem extends vscode.TreeItem implements iDatabricksWorkspaceItem {
	private _path: string;
	private _object_type: WorkspaceItemType;
	private _object_id: number;
	private _language: WorkspaceItemLanguage;
	private _onlinePathExists: boolean = true;

	constructor(
		path: string,
		object_type: WorkspaceItemType,
		object_id: number,
		language: WorkspaceItemLanguage = undefined,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(path, collapsibleState);
		this._path = path;
		this._object_type = object_type;
		this._object_id = object_id;
		this._language = language;

		if(object_type.startsWith('LOCAL_'))
		{
			this._onlinePathExists = false;
			this._object_type = object_type.replace('LOCAL_', '') as WorkspaceItemType;
		}
		
		super.label = path.split('/').pop();
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};

		// notebooks and librarie should not be expandable anymore
		if(['NOTEBOOK', 'LIBRARY'].includes(this.object_type))
		{
			super.collapsibleState = undefined;
		}
	}

	
	get tooltip(): string {
		let tooltip: string = this.path + "\n";

		if(this.onlinePathExists && !this.localPathExists)
		{
			tooltip += "[Online only]\n";
		}
		if(!this.onlinePathExists && this.localPathExists)
		{
			tooltip += "[Offline only]\n";
		}
		if (this.onlinePathExists && this.localPathExists)
		{
			tooltip += "[Synced]\n";
		}
		return tooltip;
	}

	// description is show next to the label
	get description(): string {
		return this.path;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		if(this.object_type == 'NOTEBOOK' || this.object_type == "DIRECTORY")
		{
			return 'CAN_SYNC';
		}
	}

	private getIconPath(theme: string): string {
		let sync_state: string = "";

		if (this.localPathExists && !this.onlinePathExists) { sync_state = "_OFFLINE"; }
		if (!this.localPathExists && this.onlinePathExists) { sync_state = "_ONLINE"; }

		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', this.object_type.toLowerCase() + sync_state + '.png');
	}

	readonly command = { 
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};

	get path (): string {
		return this._path;
	}

	get object_id (): number {
		return this._object_id;
	}

	get object_type (): WorkspaceItemType {
		if(!this._object_type)
		{
			return 'DIRECTORY';
		}
		return this._object_type;
	}

	get language(): WorkspaceItemLanguage {
		return this._language;
	}

	get localFolderPath(): string {
		if(this.object_type == "DIRECTORY")
		{
			return fspath.join(ActiveDatabricksEnvironment.localSyncFolder, this.path);
		}
		else
		{
			return fspath.join(ActiveDatabricksEnvironment.localSyncFolder, fspath.dirname(this.path));
		}
	}

	get localFilePath(): string {
		return fspath.join(this.localFolderPath, fspath.basename(this.path) + '.' + this.localFileExtension);
	}

	get localFileUri(): vscode.Uri {
		return vscode.Uri.parse("file:///" + this.localFilePath);
	}

	get localPathExists(): boolean {
		if(this.object_type == "DIRECTORY")
		{
			return fs.existsSync(this.localFolderPath);
		}
		else 
		{
			return fs.existsSync(this.localFilePath);
		}
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	get localFileExtension(): string {
		if(!this.language) { return ""; }
		if(this.language == "PYTHON") { return "ipynb"; }

		return this.language.toLowerCase();
	}

	get exportFormat(): WorkspaceItemExportFormat {
		if(this.language == "PYTHON") { return "JUPYTER"; }
		return "SOURCE";
	}

	static fromJson(jsonString: string): DatabricksWorkspaceTreeItem {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return new DatabricksWorkspaceTreeItem(item.path, item.object_type, item.object_id);
	}

	async getChildren(): Promise<DatabricksWorkspaceTreeItem[]> {
		if(this.object_type != 'DIRECTORY')
		{
			return null;
		}

		let onlineItems: DatabricksWorkspaceTreeItem[] = [];
		if(this.onlinePathExists)
		{
			onlineItems = await DatabricksApiService.listWorkspaceItems(this.path);
			
		}
		let onlinePaths: string[] = onlineItems.map((x) => x.path);

		let localItems: DatabricksWorkspaceTreeItem[] = [];
		if(this.localPathExists)
		{
			let localContent: string[] = fs.readdirSync(this.localFolderPath);

			for(let local of localContent)
			{
				let localFile:fspath.ParsedPath = fspath.parse(local);
				let localRelativePath = (this.path + '/' + localFile.name).replace('//', '/');
				let localFullPath = fspath.join(this.localFolderPath, local);
				
				if (!onlinePaths.includes(localRelativePath))
				{
					let localType: WorkspaceItemType = 'LOCAL_DIRECTORY';
					let language: WorkspaceItemLanguage = undefined;
					if (fs.lstatSync(localFullPath).isFile())
					{
						localType = 'LOCAL_NOTEBOOK';

						if ([".r", ".sql", ".scala"].includes(localFile.ext.toLocaleLowerCase()))
						{
							language = localFile.ext.replace('.', '').toUpperCase() as WorkspaceItemLanguage;
						}
						else if (localFile.ext.toLocaleLowerCase() == ".ipynb") {
							language = "PYTHON";
						}
						else
						{
							vscode.window.showWarningMessage("File " + localFullPath + " has no valid extension and will be ignored! Supported extensions are .r, .sql, .scala and .ipynb");
							continue;
						}
					}
					
					localItems.push(new DatabricksWorkspaceTreeItem(localRelativePath, localType, -1, language));
				}
			}
		}

		let allItems = onlineItems.concat(localItems);
		Helper.sortArrayByProperty(allItems, "label", "ASC");

		return allItems;
	}

	async download(): Promise<void> {
		if(this.object_type === 'NOTEBOOK')
		{
			try {
				//vscode.window.showInformationMessage(`Download of item ${this._path}) started ...`);
				let response = await DatabricksApiService.downloadWorkspaceItem(this.path, this.localFilePath, this.exportFormat);
				vscode.window.showInformationMessage(`Download of item ${this._path}) finished!`);

				if (ThisExtension.RefreshAfterUpDownload) {
					Helper.wait(500);
					vscode.commands.executeCommand("databricksWorkspace.refresh", false);
				}
			}
			catch (error) {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}
		}
		else if (this.object_type === 'DIRECTORY') {
			Helper.ensureLocalFolder(this.localFolderPath);
			let items: DatabricksWorkspaceTreeItem[] = await this.getChildren();

			for(let item of items)
			{
				item.download();
			}
		}
	}

	async upload(): Promise<void> {
		if(this.object_type === 'NOTEBOOK')
		{
			try {
				//vscode.window.showInformationMessage(`Upload of item ${this.path}) started ...`);
				let response = DatabricksApiService.uploadWorkspaceItem(this.localFilePath, this.path, this.language, true, this.exportFormat);
				vscode.window.showInformationMessage(`Upload of item ${this.path}) finished!`);

				if(ThisExtension.RefreshAfterUpDownload)
				{
					Helper.wait(500);
					vscode.commands.executeCommand("databricksWorkspace.refresh", false);
				}
			}
			catch (error) {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}
		}
		else if (this.object_type === 'DIRECTORY') {
			DatabricksApiService.createWorkspaceFolder(this.localFolderPath);
			let items: DatabricksWorkspaceTreeItem[] = await this.getChildren();

			for(let item of items)
			{
				item.upload();
			}
		}
	}

	async open(): Promise<void> {
		if(!this.localPathExists)
		{
			await this.download();
		}
		else
		{
			vscode.window.showWarningMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!");
		}

		vscode.workspace
				.openTextDocument(this.localFileUri)
				.then(vscode.window.showTextDocument);
	}

	async click(): Promise<void> {
		Helper.singleVsDoubleClick(this, this.singleClick, this.doubleClick);
	}

	async doubleClick(): Promise<void> {
		//vscode.window.showInformationMessage("DoubleClick");
		await this.open();
	}

	async singleClick(): Promise<void> {
		// TODO: This is not working properly as the "this" cannot be passed when used insided setTimeout?!?

		//vscode.window.showInformationMessage("SingleClick");
	}
}