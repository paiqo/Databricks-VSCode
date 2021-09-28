import * as vscode from 'vscode';
import { SQLItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSQLDatabase } from './DatabricksSQLDatabase';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { ExecutionContext } from '../../../databricksApi/_types';
import { iSQLTableColumn } from './iSQLTableDetails';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLColumn extends DatabricksSQLTreeItem {
	private _columnDefinition: iSQLTableColumn;
	private _isPartitionedBy: boolean;
	private _tableName: string;
	private _databaseName: string;

	constructor(
		columnDefinition: iSQLTableColumn,
		isPartitionedBy: boolean,
		tableName: string,
		databaseName: string,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = undefined
	) {
		super(columnDefinition.name, "COLUMN", sqlContext, collapsibleState);

		this._columnDefinition = columnDefinition;
		this._isPartitionedBy = isPartitionedBy;
		this._tableName = tableName;
		this._databaseName = databaseName;

		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;

		super.collapsibleState = undefined;
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	get _tooltip(): string {
		let tooltip: string[] = [];

		tooltip.push("USED FOR PARTITIINNG: " + this.isPartitionedBy);

		if(this.comment != undefined)
		{
			tooltip.push("COMMENT: " + this.comment);
		}

		return tooltip.join("\n");
	}

	// description is show next to the label
	get _description(): string {
		let description: string = this.datatype;

		if(this.isPartitionedBy)
		{
			description += " (PARTITIONED BY)";
		}
		return description;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return undefined;
	}

	async getChildren(): Promise<DatabricksSQLTreeItem[]> {
		return undefined;
	}

	get columnName(): string {
		return this._columnDefinition.name;
	}

	get datatype(): string {
		return this._columnDefinition.dataType;
	}

	get comment(): string {
		return this._columnDefinition.comment;
	}

	get isPartitionedBy(): boolean {
		return this._isPartitionedBy;
	}

	get tableName(): string {
		return this._tableName;
	}

	get databaseName(): string {
		return this._databaseName;
	}
}