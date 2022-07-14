import * as vscode from 'vscode';
import * as fspath from 'path';

import { WorkspaceItemType } from './_types';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceLibrary extends DatabricksWorkspaceTreeItem {

	constructor(
		path: string,
		object_id: number,
		parent: DatabricksWorkspaceTreeItem
	) {
		super(path, "LIBRARY", object_id, parent, vscode.TreeItemCollapsibleState.None);

		super.tooltip = this._tooltip;
	}

	get _tooltip(): string {
		let tooltip: string = "[Online only]";
		return tooltip;
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'library' + '.png');
	}

	readonly command = null;

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceLibrary {
		return new DatabricksWorkspaceLibrary(item.path, item.object_id, parent);
	}

	public static fromJSON(jsonString: string, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceLibrary {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceLibrary.fromInterface(item, parent);
	}
}