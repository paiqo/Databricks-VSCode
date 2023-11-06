import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksUCTreeItem } from './DatabricksUCTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';
import { iDatabricksUCSystemSchema } from './iDatabricksUCSystemTable';
import { DatabricksUCSystemSchemas } from './DatabricksUCSystemSchemas';
import { DatabricksUCMetastore } from './DatabricksUCMetastore';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksUCSystemSchema extends DatabricksUCTreeItem {
	
	constructor(
		definition: iDatabricksUCSystemSchema,
		parent: DatabricksUCSystemSchemas
	) {
		super("SYSTEMSCHEMA", definition.schema, definition.schema, definition, parent, vscode.TreeItemCollapsibleState.None);

		super.label = this.name;
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = this.getThemeIcon();
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
		return this.definition.state;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		let actions: string[] = super._contextValue.split(",").filter(item => item.length > 0);

		switch(this.definition.state)
		{
			case "AVAILABLE":
				actions.push("ENABLE");
				break;
			case "ENABLE_COMPLETED":
				actions.push("DISABLE");
				break;
		}

		// use , as separator to allow to check for ,<value>, in package.json when condition
		return "," + actions.join(",") + ",";
	}

	protected  getThemeIcon(): vscode.ThemeIcon {
		switch(this.definition.state)
		{
			case "AVAILABLE":
				return new vscode.ThemeIcon("issue-opened");
			case "UNAVAILABLE":
				return new vscode.ThemeIcon("error");
			case "ENABLE_COMPLETED":
				return new vscode.ThemeIcon("issue-closed");
		}
	}

	get definition(): iDatabricksUCSystemSchema {
		return this._definition as iDatabricksUCSystemSchema;
	}

	async enable(): Promise<void> {
		const metastore = this.getParentByType<DatabricksUCMetastore>("METASTORE");

		await DatabricksApiService.enableUCSystemSchema(metastore.metastore_id, this.definition.schema);

		setTimeout(() => this.refreshParent(), 1000);
	}

	async disable(): Promise<void> {
		const metastore = this.getParentByType<DatabricksUCMetastore>("METASTORE");
		
		await DatabricksApiService.disableUCSystemSchema(metastore.metastore_id, this.definition.schema);

		setTimeout(() => this.refreshParent(), 1000);
	}
}