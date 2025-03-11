import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { DatabricksFSDirectory } from './DatabricksFSDirectory';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSTreeItem extends vscode.TreeItem implements iDatabricksFSItem {
	private _path: string;
	private _is_dir: boolean;
	private _fileSize: number;
	private _modification_time: number;
	private _parent: DatabricksFSDirectory;
	protected _isInitialized: boolean = false;

	constructor(
		path: string,
		is_dir: boolean,
		size: number,
		modifcation_time: number,
		parent?: DatabricksFSDirectory,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(path, collapsibleState);
		this._path = path;
		this._is_dir = is_dir;
		this._fileSize = size;
		this._modification_time = modifcation_time;
		this._parent = parent;

		// files are not expandable
		if (!this.is_dir) {
			this.collapsibleState = undefined;
		}

		this._isInitialized = true;

		this.init();
	}

	async init(): Promise<void> {
		// we can only run initialize for this class after all values had been set in the constructor
		// but we must not run it as part of the call to super()
		if (this._isInitialized) {
			this.label = this.path.split('/').pop();
			this.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			};

			this.resourceUri = this.dbfsUri;
		}
	}

	protected getIconPath(theme: string): vscode.Uri {
		let itemType = (this.is_dir ? 'directory' : 'notebook');
		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, 'workspace', itemType + '.png');
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
	get path(): string {
		return this._path;
	}

	get is_dir(): boolean {
		return this._is_dir;
	}

	get file_size(): number {
		return this._fileSize;
	}

	get modification_time(): number {
		return this._modification_time;
	}

	get parent(): DatabricksFSDirectory {
		return this._parent;
	}

	set parent(value: DatabricksFSDirectory) {
		this._parent = value;
	}

	get dbfsUri(): vscode.Uri {
		return vscode.Uri.parse(ThisExtension.DBFS_SCHEME + ":" + this.path);
	}

	public static fromInterface(item: iDatabricksFSItem, parent: DatabricksFSDirectory): DatabricksFSTreeItem {
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size, item.modification_time);
	}

	static fromJson(jsonString: string): DatabricksFSTreeItem {
		let item: iDatabricksFSItem = JSON.parse(jsonString);
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size, item.modification_time);
	}

	public CopyPathToClipboard(): void {
		vscode.env.clipboard.writeText(this.path)
	}

	async refreshParent(): Promise<void> {
		vscode.commands.executeCommand("databricksFS.refresh", this.parent,false);
	}
}