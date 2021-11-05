import * as vscode from 'vscode';
import * as fspath from 'path';

import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceFile extends DatabricksWorkspaceTreeItem {

	constructor(
		path: string,
		object_id: number
	) {
		super(path, "FILE", object_id, null, vscode.TreeItemCollapsibleState.None);

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

	public static fromInterface(item: iDatabricksWorkspaceItem): DatabricksWorkspaceFile {
		return new DatabricksWorkspaceFile(item.path, item.object_id);
	}

	public static fromJSON(jsonString: string): DatabricksWorkspaceFile {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceFile.fromInterface(item);
	}

	async compare(): Promise<void> {
		vscode.window.showErrorMessage("[Compare] is currently only supported on a single notebook!");
		return;
	}
}