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

	constructor(
		name: string,
		itemType: SQLItemType,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);

		this._name = name;
		this._itemType = itemType;
		this._sqlContext = sqlContext;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	private getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootPath, 'resources', theme, 'sql',  this.itemType.toLowerCase() + '.png');
	}

	private getCommand(): vscode.Command {
		/*
		return { 
			command: 'databricksSecretItem.open', title: "Open File", arguments: [this]
		};
		*/
		return undefined;
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
}