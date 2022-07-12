import * as vscode from 'vscode';

import { ClusterTreeItemType } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksClusterTreeItem extends vscode.TreeItem {
	private _item_type: ClusterTreeItemType;
	private _name: string;
	private _parent: DatabricksClusterTreeItem;

	constructor(
		type: ClusterTreeItemType,
		name: string,
		parent: DatabricksClusterTreeItem,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);
		this._name = name;
		this._item_type = type;
		this._parent = parent;
	}

	get item_type(): ClusterTreeItemType {
		return this._item_type;
	}

	get name(): string {
		return this._name;
	}

	get parent(): DatabricksClusterTreeItem {
		return this._parent;
	}

	async getChildren(): Promise<DatabricksClusterTreeItem[]> {
		return []
	}
}