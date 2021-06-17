import * as vscode from 'vscode';
import { SQLItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSQLDatabase } from './DatabricksSQLDatabase';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { ExecutionContext } from '../../../databricksApi/_types';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLColumn extends DatabricksSQLTreeItem {
	private _columnName: string;
	private _datatype: string;
	private _tableName: string;
	private _databaseName: string;

	constructor(
		columnName: string,
		datatype: string,
		tableName: string,
		databaseName: string,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = undefined
	) {
		super(columnName, "COLUMN", sqlContext, collapsibleState);

		this._columnName = columnName;
		this._datatype = datatype;
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
		let tooltip: string = this.columnName + "(" + this.datatype.toUpperCase() + ")";

		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		return this.datatype;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return undefined;
	}

	async getChildren(): Promise<DatabricksSQLTreeItem[]> {
		return undefined;
	}

	get columnName(): string {
		return this._columnName;
	}

	get datatype(): string {
		return this._datatype;
	}

	get tableName(): string {
		return this._tableName;
	}

	get databaseName(): string {
		return this._databaseName;
	}
}