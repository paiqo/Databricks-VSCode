import * as vscode from 'vscode';

import { DatabricksSQLTreeItem } from './DatabricksSQLTreeItem';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ExecutionContext, iDatabricksApiCommandsStatusResponse } from '../../../databricksApi/_types';
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

		let result: iDatabricksApiCommandsStatusResponse = await DatabricksApiService.getCommandResult(cmd);

		let tables: DatabricksSQLTable[] = [];
		for (let tbl of result.results.data) {
			tables.push(await DatabricksSQLTable.CreateAsync(tbl[0], tbl[1], tbl[2], this.sqlContext));
		}
		
		return tables;
	}

	get databaseName(): string {
		return this._databaseName;
	}
}