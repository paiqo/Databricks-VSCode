import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { ThisExtension } from '../../../ThisExtension';
import { SQLItemType } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLSelectCluster extends DatabricksSQLTreeItem {

	constructor() {
		super("Please select a cluster first!", undefined, undefined, vscode.TreeItemCollapsibleState.None);
	}

	get itemType(): SQLItemType {
		return 'DATABASE';
	}
}