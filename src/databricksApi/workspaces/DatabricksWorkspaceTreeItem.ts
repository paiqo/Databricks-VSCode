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
		return `${this.path}-${this._object_type}`;
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
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', this.object_type.toLowerCase() + '.svg');
	}

	readonly command = { 
		command: 'databricksWorkspaceItem.open', title: "Open File", arguments: [this]
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

	get localFileExists(): boolean {
		return fs.existsSync(this.localFilePath);
	}

	get localFileExtension(): string {
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

	getChildren(): Thenable<DatabricksWorkspaceTreeItem[]> {
		if(this.object_type === 'DIRECTORY')
		{
			return DatabricksApiService.listWorkspaceItems(this.path);
		}
		return null;
	}

	async download(): Promise<void> {
		if(this.object_type === 'NOTEBOOK')
		{
			try {
				let response = await DatabricksApiService.downloadWorkspaceItem(this.path, this.localFilePath, this.exportFormat);
				vscode.window.showInformationMessage(`Download of item ${this._path}) finished!`);
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
				let response = DatabricksApiService.uploadWorkspaceItem(this.localFilePath, this.path, this.language, true, this.exportFormat);
				vscode.window.showInformationMessage(`Upload of item ${this.path}) finished!`);
			}
			catch (error) {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}
			/*
			let response = DatabricksApiService.uploadWorkspaceItem(this.localFilePath, this.path, this.language, true, this.exportFormat);

			response.catch((error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}).then(() => {
				vscode.window.showInformationMessage(`Upload of item ${this._path}) finished!`);
			});
			*/
		}
		else if (this.object_type === 'DIRECTORY') {
			DatabricksApiService.createWorkspaceFolder(this.localFolderPath);
			let items: DatabricksWorkspaceTreeItem[] = await this.getChildren();

			for(let item of items)
			{
				item.upload();
			}
			/*
			let items = this.getChildren();

			items.then((items) => {
					for (let item of items) {
						item.upload();
					}
				}
			);
			*/
		}
	}

	open(): void {
		if(!this.localFileExists)
		{
			this.download();
		}
		else
		{
			vscode.window.showWarningMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!");
		}

		vscode.workspace
				.openTextDocument(this.localFileUri)
				.then(vscode.window.showTextDocument);
		//vscode.window.showTextDocument(this.localFileUri);
	}
}