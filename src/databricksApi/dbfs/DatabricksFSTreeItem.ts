import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSTreeItem extends vscode.TreeItem implements iDatabricksFSItem {
	private _path: string;
	private _is_dir: boolean;
	private _size: number;
	
	constructor(
		path: string,
		is_dir: boolean,
		size: number,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(path, collapsibleState);
		this._path = path;
		this._is_dir = is_dir;
		this._size = size;

		super.label = path.split('/').pop();
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};

		// files are not expandable
		if(!this.is_dir)
		{
			super.collapsibleState = undefined;
		}
	}

	get tooltip(): string {
		return `${this.path}`;
	}

	// description is show next to the label
	get description(): string {
		return this.path;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		if(!this.is_dir)
		{
			return 'CAN_DOWNLOAD';
		}
	}

	private getIconPath(theme: string): string {
		let itemType = (this.is_dir ? 'directory' : 'notebook');
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', itemType + '.svg');
	}

	get path (): string {
		return this._path;
	}

	get is_dir (): boolean {
		return this._is_dir;
	}

	get size (): number {
		return this.size;
	}

	static fromJson(jsonString: string): DatabricksFSTreeItem {
		let item: iDatabricksFSItem = JSON.parse(jsonString);
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.size);
	}

	getChildren(): Thenable<DatabricksFSTreeItem[]> {
		if(this.is_dir)
		{
			return DatabricksApiService.listDBFSItems(this.path);
		}
		return null;
	}

	download(localBasePath: string): void {
		if(!this.is_dir)
		{
			throw new Error("Not implemented yet!");
			/*
			let response = DatabricksApiService.downloadWorkspaceItem(this._path, fspath.join(localBasePath, this._path + '.ipynb'));

			response.catch((error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}).finally(() => {
				vscode.window.showInformationMessage(`Download of item ${this._path}) finished!`);
			});
			*/
		}
		else
		{
			throw new Error("Only a single file can be downloaded!");
		}
		
	}
}