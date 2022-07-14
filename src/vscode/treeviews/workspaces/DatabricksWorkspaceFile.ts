import * as vscode from 'vscode';
import * as fspath from 'path';

import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceFile extends DatabricksWorkspaceTreeItem {

	constructor(
		path: string,
		object_id: number,
		parent: DatabricksWorkspaceTreeItem
	) {
		super(path, "FILE", object_id, parent, vscode.TreeItemCollapsibleState.None);

		super.tooltip = this._tooltip;
	}

	get _tooltip(): string {
		let tooltip: string = "[Online only]";
		return tooltip;
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'file' + '.png');
	}

	readonly command = null;

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceFile {
		return new DatabricksWorkspaceFile(item.path, item.object_id, parent);
	}

	public static fromJSON(jsonString: string, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceFile {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceFile.fromInterface(item, parent);
	}
}