import * as vscode from 'vscode';

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

	protected getIconPath(theme: string): vscode.Uri {
		return vscode.Uri.joinPath(ThisExtension.rootUri, 'resources', theme, 'workspace', 'library' + '.png');
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