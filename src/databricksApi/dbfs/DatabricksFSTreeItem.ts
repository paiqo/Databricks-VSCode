import * as vscode from 'vscode';
import * as fspath from 'path';
import { ThisExtension } from '../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';
import { DatabricksFSFile } from './DatabricksFSFile';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSTreeItem extends vscode.TreeItem implements iDatabricksFSItem {
	private _path: string;
	private _is_dir: boolean;
	private _fileSize: number;
	
	constructor(
		path: string,
		is_dir: boolean,
		size: number,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(path, collapsibleState);
		this._path = path;
		this._is_dir = is_dir;
		this._fileSize = size;

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
		let tooltip: string = "Path: " + this.path + "\n";
		return tooltip;
	}

	// description is show next to the label
	get description(): string {
		return this.path;
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get contextValue(): string {
		return undefined;
	}

	protected getIconPath(theme: string): string {
		let itemType = (this.is_dir ? 'directory' : 'notebook');
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', itemType + '.png');
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	public async getChildren(): Promise<DatabricksFSTreeItem[]> {
		await vscode.window.showErrorMessage("getChildren is not implemented! Please overwrite in derived class!");
		return undefined;
	}

	/* iDatabrickFSItem implementatin */
	get path (): string {
		return this._path;
	}

	get is_dir (): boolean {
		return this._is_dir;
	}

	get file_size (): number {
		return this._fileSize;
	}

	public static fromInterface(item: iDatabricksFSItem): DatabricksFSTreeItem {
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size);
	}

	static fromJson(jsonString: string): DatabricksFSTreeItem {
		let item: iDatabricksFSItem = JSON.parse(jsonString);
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size);
	}
}