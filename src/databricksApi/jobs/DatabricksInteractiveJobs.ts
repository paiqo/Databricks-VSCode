import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { JobTreeItemType, iDatabricksJobRun } from './_types';
import { iDatabricksJob } from './_types';
import { Helper } from '../../helpers/Helper';
import { DatabricksJobTreeItem } from './DatabricksJobTreeItem';
import { DatabricksJobRun } from './DatabricksJobRun';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksInteractiveJobs extends DatabricksJobTreeItem {
	
	constructor(
	) {
		super("JOB", null, null, null, vscode.TreeItemCollapsibleState.Collapsed);

		super.label = "Interactive Jobs";

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get tooltip(): string {
		return "Executed via 'dbutils.notebook.run()' or Submit REST API.";
	}

	// description is show next to the label
	get description(): string {
		return `(MANUALLY)`;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		return "INTERACTIVE_JOBS";
	}

	protected  getIconPath(theme: string): string {
		let state: string = "job";

		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'directory' + '.png');
	}

	readonly command = null;

	async getChildren(): Promise<DatabricksJobRun[]> {
		let responseData = await DatabricksApiService.listJobRuns();
		// array of file is in result.files
		let items = responseData.runs.filter(item => item.run_type != "JOB_RUN");

		let jobItems: DatabricksJobRun[] = [];
		if (items != undefined) {
			items.map(item => jobItems.push(DatabricksJobRun.fromJSON(JSON.stringify(item))));
			Helper.sortArrayByProperty(jobItems, "start_time", "DESC");
		}

		return jobItems;
	}
}