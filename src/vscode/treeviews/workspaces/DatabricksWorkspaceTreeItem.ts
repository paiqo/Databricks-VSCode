import * as vscode from 'vscode';
import * as fspath from 'path';
import { WorkspaceItemType, WorkspaceItemLanguage } from './_types';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';

export class DatabricksWorkspaceTreeItem extends vscode.TreeItem implements iDatabricksWorkspaceItem {
	protected _path: string;
	protected _object_type: WorkspaceItemType;
	protected _object_id: number;
	protected _language: WorkspaceItemLanguage | undefined;

	constructor(
		path: string,
		object_type: WorkspaceItemType,
		object_id: number,
		language?: WorkspaceItemLanguage,
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
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', this.object_type.toLowerCase() + '.png');
	}	

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	public async getChildren(): Promise<DatabricksWorkspaceTreeItem[]> {
		await vscode.window.showErrorMessage("getChildren is not implemented! Please overwrite in derived class!");
		return undefined;
	}

	/* iDatabrickWorkspaceItem implementatin */
	public get path(): string {
		return this._path;
	}

	get object_type(): WorkspaceItemType {
		if (!this._object_type) {
			return 'DIRECTORY';
		}
		return this._object_type;
	}

	public get object_id(): number {
		return this._object_id;
	}

	public get language(): WorkspaceItemLanguage | undefined {
		return this._language;
	}

	public static fromInterface(item: iDatabricksWorkspaceItem): DatabricksWorkspaceTreeItem {
		return new DatabricksWorkspaceTreeItem(item.path, item.object_type, item.object_id, item.language);
	}

	public static fromJSON(itemDefinition: string): DatabricksWorkspaceTreeItem {
		let item: iDatabricksWorkspaceItem = JSON.parse(itemDefinition);
		return DatabricksWorkspaceTreeItem.fromInterface(item);
	}
}