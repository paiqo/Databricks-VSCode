import * as vscode from 'vscode';

import { SQLItemType } from './_types';

import { ThisExtension } from '../../../ThisExtension';
import { ExecutionContext } from '../../../databricksApi/_types';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLTreeItem extends vscode.TreeItem {
	
	private _itemType: SQLItemType;
	private _name: string;
	private _sqlContext: ExecutionContext;
	protected _parent: DatabricksSQLTreeItem;

	constructor(
		name: string,
		itemType: SQLItemType,
		sqlContext: ExecutionContext,
		parent: DatabricksSQLTreeItem,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);

		this._name = name;
		this._itemType = itemType;
		this._sqlContext = sqlContext;
		this._parent = parent;

		this.init();
	}

	async init(): Promise<void> {
		super.contextValue = this._contextValue;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	private getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, 'sql',  this.itemType.toLowerCase() + '.png');
	}

	private getCommand(): vscode.Command {
		/*
		return { 
			command: 'databricksSecretItem.open', title: "Open File", arguments: [this]
		};
		*/
		return undefined;
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get _contextValue(): string {
		return this.itemType;
	}

	public get parent(): DatabricksSQLTreeItem | undefined {
		return this._parent;
	}

	async getChildren(): Promise<DatabricksSQLTreeItem[]> {
		await vscode.window.showErrorMessage("getChildren is not implemented! Please overwrite in derived class!");
		return undefined;
	}

	get itemType(): SQLItemType {
		return this._itemType;
	}

	get sqlContext(): ExecutionContext {
		return this._sqlContext;
	}

	async refresh(): Promise<void> {
		vscode.commands.executeCommand("databricksSQL.refresh", this, false);
	}

	async refreshParent(): Promise<void> {
		vscode.commands.executeCommand("databricksSQL.refresh", this.parent, false);
	}
}