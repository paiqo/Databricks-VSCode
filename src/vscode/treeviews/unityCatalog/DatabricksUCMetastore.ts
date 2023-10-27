import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { DatabricksUCTreeItem } from './DatabricksUCTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';
import { iDatabricksUCMetastore } from './iDatabricksUCMetastore';
import { DatabricksUCSystemSchemas } from './DatabricksUCSystemSchemas';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksUCMetastore extends DatabricksUCTreeItem {
	
	constructor(
		definition: iDatabricksUCMetastore
	) {
		super("METASTORE", definition.metastore_id, definition.name, definition, vscode.TreeItemCollapsibleState.Collapsed);

		super.label = this.name;
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	// tooltip shown when hovering over the item
	get _tooltip(): string {
		let tooltip: string = "";
		for (const [key, value] of Object.entries(this.definition)) {
			if (typeof value === "string") {
				if (value.length > 100) {
					continue;
				}
			}
			tooltip += `${key}: ${JSON.stringify(value, null, 4)}\n`;
		}

		return tooltip.trim();
	}

	// description is show next to the label
	get _description(): string {
		return `${this.definition.metastore_id} - ${this.definition.region}`;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return this.type;
	}

	protected  getIconPath(theme: string): vscode.Uri {
		let state: string = "UC";

		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, state + '.png');
	}

	readonly command = {
		command: 'databricksUCItem.click', title: "Open File", arguments: [this]
	};


	get definition(): iDatabricksUCMetastore {
		return this._definition as iDatabricksUCMetastore;
	}

	get link(): string {
		let actConn = ThisExtension.ActiveConnection;
		let link: string = "";//Helper.trimChar(FSHelper.joinPathSync(actConn.apiRootUrl, "?#UC", this.UC_id.toString()).toString(true), '/');
		
		return link;
	}

	public static fromInterface(item: iDatabricksUCMetastore): DatabricksUCMetastore {
		return new DatabricksUCMetastore(item);
	}

	public static fromJSON(itemDefinition: string): DatabricksUCMetastore {
		let item: iDatabricksUCMetastore = JSON.parse(itemDefinition);
		return DatabricksUCMetastore.fromInterface(item);
	}

	async getChildren(): Promise<DatabricksUCTreeItem[]> {
		let items: DatabricksUCTreeItem[] = [];

		items.push(new DatabricksUCSystemSchemas(this.definition));
		
		return items;
	}
}