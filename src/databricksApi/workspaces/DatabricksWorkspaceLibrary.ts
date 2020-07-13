import * as vscode from 'vscode';
import * as fspath from 'path';

import { WorkspaceItemType } from './_types';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../ThisExtension';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceLibrary extends DatabricksWorkspaceTreeItem {

	constructor(
		path: string,
		object_id: number
	) {
		super(path, "LIBRARY", object_id, null, vscode.TreeItemCollapsibleState.None);
	}

	get tooltip(): string {
		let tooltip: string = "[Online only]";
		return tooltip;
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'library' + '.png');
	}

	readonly command = null;

	public static fromInterface(item: iDatabricksWorkspaceItem): DatabricksWorkspaceLibrary {
		return new DatabricksWorkspaceLibrary(item.path, item.object_id);
	}

	public static fromJSON(jsonString: string): DatabricksWorkspaceLibrary {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceLibrary.fromInterface(item);
	}

	async compare(): Promise<void> {
		vscode.window.showErrorMessage("[Compare] is currently only supported on a single notebook!");
		return;
	}
}