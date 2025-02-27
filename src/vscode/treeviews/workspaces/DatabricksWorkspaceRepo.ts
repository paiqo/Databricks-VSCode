import * as vscode from 'vscode';

import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';
import { DatabricksWorkspaceDirectory } from './DatabricksWorkspaceDirectory';
import { DatabricksKernel } from '../../notebook/DatabricksKernel';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceRepo extends DatabricksWorkspaceDirectory {

	constructor(
		path: string,
		object_id: number,
		local_path?: vscode.Uri,
		parent: DatabricksWorkspaceTreeItem = undefined
	) {
		super(path, object_id, local_path, parent);

		DatabricksKernel.addRepo(this.localPath);
	}

	public static fromInterface(item: iDatabricksWorkspaceItem, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceRepo {
		return new DatabricksWorkspaceRepo(item.path, item.object_id, null, parent);
	}

	public static fromJSON(jsonString: string, parent: DatabricksWorkspaceTreeItem = null): DatabricksWorkspaceRepo {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceRepo.fromInterface(item, parent);
	}

	set localPath(value: vscode.Uri) {
		this._localPath = value;
		DatabricksKernel.addRepo(value);
	}
}