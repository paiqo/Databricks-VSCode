import * as vscode from 'vscode';

import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { SQLItemType } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLSelectCluster extends DatabricksSQLTreeItem {

	constructor() {
		super("Please select a cluster first!", undefined, undefined, undefined, vscode.TreeItemCollapsibleState.None);
	}

	get itemType(): SQLItemType {
		return 'DATABASE';
	}
}