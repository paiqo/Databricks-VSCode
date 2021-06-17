import * as vscode from 'vscode';
import { SQLItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSQLDatabase } from './DatabricksSQLDatabase';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { ExecutionContext } from '../../../databricksApi/_types';
import { DatabricksSQLColumn } from './DatabricksSQLColumn';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLTable extends DatabricksSQLTreeItem {
	private _tableName: string;
	private _databaseName: string;

	constructor(
		tableName: string,
		databaseName: string,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(tableName, "TABLE", sqlContext, collapsibleState);

		this._tableName = tableName;
		this._databaseName = databaseName;
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	async getChildren(): Promise<DatabricksSQLColumn[]> {
		let cmd = await DatabricksApiService.runCommand(this.sqlContext, `SHOW CREATE TABLE \`${this.databaseName}\`.\`${this.tableName}\``);

		let result = await DatabricksApiService.getCommandResult(cmd);

		let sqlCmd: string = result[0].createtab_stmt;

		let sqlColumns = this.parseCreateStatement(sqlCmd);

		return sqlColumns;
	}

	public parseCreateStatement(stmt: string): DatabricksSQLColumn[] {
		let columnString: string = stmt.match(/\(([^)]*)\)/gm)[0];

		let columnMatches = columnString.matchAll(/\s`([^`]*)`\s([^,]*),/gm);

		let columns: DatabricksSQLColumn[] = [];
		for (const col of columnMatches) {
			columns.push(new DatabricksSQLColumn(col[1], col[2], this.tableName, this.databaseName, this.sqlContext));
		}

		return columns;
	}

	get tableName(): string {
		return this._tableName;
	}

	get databaseName(): string {
		return this._databaseName;
	}
}