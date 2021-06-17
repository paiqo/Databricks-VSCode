import * as vscode from 'vscode';
import { SQLItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ExecutionContext } from '../../../databricksApi/_types';
import { DatabricksSQLTable } from './DatabricksSQLTable';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSQLDatabase extends DatabricksSQLTreeItem {
	private _databaseName: string;

	constructor(
		name: string,
		sqlContext: ExecutionContext,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, "DATABASE", sqlContext, collapsibleState);

		this._databaseName = name;	
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	async getChildren(): Promise<DatabricksSQLTable[]> {
		let cmd = await DatabricksApiService.runCommand(this.sqlContext, "SHOW TABLES IN `" + this.databaseName + "`");

		let result = await DatabricksApiService.getCommandResult(cmd);

		let tables: DatabricksSQLTable[] = [];
		for (let db of result) {
			tables.push(new DatabricksSQLTable(db.tableName, this.databaseName, this.sqlContext));
		}
		
		return tables;
	}


	get databaseName(): string {
		return this._databaseName;
	}
}