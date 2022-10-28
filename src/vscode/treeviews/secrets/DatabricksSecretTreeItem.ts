import * as vscode from 'vscode';

import { SecretTreeItemType } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSecretTreeItem extends vscode.TreeItem {
	protected _itemType: SecretTreeItemType;
	protected _path: string; // path like /secret-scope/secret-name
	protected _parent: DatabricksSecretTreeItem;

	constructor(
		type: SecretTreeItemType,
		name: string,
		parent: DatabricksSecretTreeItem = null,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);
		this._itemType = type
		this._parent = parent;
		this._path = name;
	}

	get path(): string {
		return this._path;
	}

	get itemType(): SecretTreeItemType {
		return this._itemType;
	}

	get parent(): DatabricksSecretTreeItem {
		return this._parent;
	}

	async getChildren(): Promise<DatabricksSecretTreeItem[]> {
		// needs to be overwritten in derived class
		throw new Error("Not implemented!");

	}

	async refreshParent(): Promise<void> {
		vscode.commands.executeCommand("databricksSecrets.refresh", this.parent, false);
	}

	
	get codeText(): string {
		// needs to be overwritten in derived class
		throw new Error("Not implemented!");
	}
}