import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksUCTreeItem } from './DatabricksUCTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';
import { iDatabricksUCMetastore } from './iDatabricksUCMetastore';
import { DatabricksUCSystemSchema } from './DatabricksUCSystemSchema';
import { iDatabricksUCSystemSchema } from './iDatabricksUCSystemTable';
import { DatabricksUCMetastore } from './DatabricksUCMetastore';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksUCSystemSchemas extends DatabricksUCTreeItem {
	private metastore: iDatabricksUCMetastore;
	constructor(
		parent: DatabricksUCMetastore
	) {
		super("SYSTEMSCHEMAS", parent.definition.metastore_id + "/SYSTEMSCHEMAS", "System Schemas", undefined, parent, vscode.TreeItemCollapsibleState.Collapsed);

		this.metastore = parent.definition;

		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return this.type;
	}

	protected getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, 'workspace', 'directory.png');
	}

	async getChildren(): Promise<DatabricksUCSystemSchema[]> {
		let items: DatabricksUCSystemSchema[] = [];

		let apiItems: iDatabricksUCSystemSchema[] = await DatabricksApiService.listUCSystemSchemas(this.metastore.metastore_id);

		if (apiItems) {
			apiItems.map(item => items.push(new DatabricksUCSystemSchema(item, this)));
		}

		return items;
	}
}