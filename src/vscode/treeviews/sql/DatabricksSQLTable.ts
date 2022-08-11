import * as vscode from 'vscode';
import { SQLItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSQLDatabase } from './DatabricksSQLDatabase';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { ExecutionContext } from '../../../databricksApi/_types';
import { DatabricksSQLColumn } from './DatabricksSQLColumn';
import { iSQLTableColumn, iSQLTableDetails, iSQLTableProperty } from './iSQLTableDetails';
import { table } from 'console';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLTable extends DatabricksSQLTreeItem {
	private _tableName: string;
	private _databaseName: string;
	private _isTemporary: boolean;
	private _tableDetails: iSQLTableDetails;

	constructor(
		tableDetails: iSQLTableDetails,
		isTemporary: boolean,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(tableDetails.name, "TABLE", sqlContext, collapsibleState);

		this._tableDetails = tableDetails;
		this._tableName = this._tableDetails.name;
		this._databaseName = this._tableDetails.databaseName;
		this._isTemporary = isTemporary;


		super.description = this._description;
		super.tooltip = this._tooltip;
		super.contextValue = this._contextValue;

		if (this._isTemporary) {
			super.description = "(temporary)";
		}
	}

	public static async CreateAsync(
		databaseName: string,
		tableName: string,
		isTemporary: boolean,
		sqlContext: ExecutionContext
	): Promise<DatabricksSQLTable> {
		let tableDetails = await DatabricksSQLTable.getTableDetailsFromDatabricks(databaseName, tableName, sqlContext);
		
		return new DatabricksSQLTable(tableDetails, isTemporary, sqlContext);
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	get _tooltip(): string {
		let tooltip: string[] = [this._description];

		if (this.isPartitioned) {
			tooltip.push("PARTITIONED BY " + this._tableDetails.partitioningColumns.map(x => x.name).join(", "));
		}

		if (this._tableDetails.tableProperties.length > 0) {
			tooltip.push("TBLPROPERTIES: \n" + this._tableDetails.tableProperties.map(x => "\t" + x.key + " = " + x.value).join("\n"));
		}

		return tooltip.join("\n");
	}

	// description is show next to the label
	get _description(): string {
		if (this._tableDetails.type == "VIEW") {
			return "VIEW";
		}
		if (this._tableDetails.isManaged) {
			return this._tableDetails.format + ": " + "Databricks managed";
		}
		else {
			return this._tableDetails.format + ": " + this._tableDetails.location;
		}
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get _contextValue(): string {
		return 'TABLE';
	}

	async getChildren(): Promise<DatabricksSQLColumn[]> {
		let columns: DatabricksSQLColumn[] = [];
		for (const col of this._tableDetails.columns) {
			let isPartitionedBy: boolean = this._tableDetails.partitioningColumns.includes(col);
			columns.push(new DatabricksSQLColumn(col, isPartitionedBy, this.tableName, this.databaseName, this.sqlContext));
		}
		
		return columns;
	}

	get tableName(): string {
		return this._tableName;
	}

	get databaseName(): string {
		return this._databaseName;
	}

	get isPartitioned(): boolean {
		return this._tableDetails.partitioningColumns.length > 0;
	}

	private static async getTableDetailsFromDatabricks(databaseName: string, tableName: string, sqlContext): Promise<iSQLTableDetails> {
		let cmd = await DatabricksApiService.runCommand(sqlContext, `SHOW CREATE TABLE \`${databaseName}\`.\`${tableName}\``);

		let result = await DatabricksApiService.getCommandResult(cmd);

		try
		{
			let sqlCmd: string = result[0].createtab_stmt;

			let tableDetails = await this.parseCreateTableStatement(sqlCmd);
			tableDetails.name = tableName;
			tableDetails.createStatement = sqlCmd;

			return tableDetails;
		}
		catch(error)
		{
			let errorTable:iSQLTableDetails = {
					createStatement: result.data.results.summary + "\n" + result.data.results.cause,
					databaseName: databaseName,
					name: tableName,
					type: result.data.results.resultType,
					isManaged: false,
					format: "ERROR",
					location: result.data.results.summary,
					isTemporary: false,
					columns: [],
					partitioningColumns: [],
					tableProperties: []
				};

			return errorTable;
		}
	}

	private static async parseCreateTableStatement(stmt: string): Promise<iSQLTableDetails> {
		let type = Helper.getFirstRegexGroup(/CREATE\s*([^\s]*)/gm, stmt);
		let databaseName = Helper.getFirstRegexGroup(/CREATE .*`.*`\.`([^`]*)`/gm, stmt);
		let format: string = Helper.getFirstRegexGroup(/USING\s*([^\s]*)/gm, stmt);

		let isManaged: boolean = true;
		let location: string = Helper.getFirstRegexGroup(/LOCATION\s*'([^']*)'/gm, stmt);
		if (location != null) {
			isManaged = false;
		}

		if (type == "VIEW") {
			format = "VIEW";
			location = "<view>";
		}

		let columnsString: string = stmt.match(/\(\s*([^)]*)\s*\)/gm)[0] + ","; // everything between the first brackets, adding ',' at the end to make next RegEx easier
		let columnMatches = columnsString.matchAll(/\n\s*(\`(?:[^\`]+|\`\`)*\`|[^ ]+)\s+([^\s]*)(.*?(?=COMMENT|,$|\)))(\s*COMMENT\s*'([^']*)')?[,)]/gm);

		let columns: iSQLTableColumn[] = [];
		for (const col of columnMatches) {
			columns.push({ name: col[1], dataType: col[2], comment: col[4] });
		}

		let partitioningColumns: iSQLTableColumn[] = [];
		let partitionBy: string = Helper.getFirstRegexGroup(/PARTITIONED\s*BY\s*\(([^)]*)\)/gm, stmt);
		if (partitionBy != null) {
			let partCols = partitionBy.split(",").map(x => x.trim());
			partitioningColumns = columns.filter(x => partCols.includes(x.name));
		}

		let tblProperties: iSQLTableProperty[] = [];
		let tblPropertiesString: string = Helper.getFirstRegexGroup(/TBLPROPERTIES\s*\(([^)]*)\)/gm, stmt);
		if (tblPropertiesString != null) {
			let tblPropertiesMatches = tblPropertiesString.matchAll(/\s.*'([^']*)'\s*=\s*'([^']*)'/gm);

			for (const prop of tblPropertiesMatches) {
				tblProperties.push({ key: prop[1], value: prop[2] });
			}
		}

		return {
			createStatement: stmt,
			databaseName: databaseName,
			name: "TEMP", // overwritten later
			type: type,
			isManaged: isManaged,
			format: format.toUpperCase(),
			location: location,
			isTemporary: false,
			columns: columns,
			partitioningColumns: partitioningColumns,
			tableProperties: tblProperties
		};
	}

	async showDefinition(): Promise<vscode.TextDocument> {
		return vscode.workspace.openTextDocument({ language: "sql", content: this._tableDetails.createStatement });
	}
}