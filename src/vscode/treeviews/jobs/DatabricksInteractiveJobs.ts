import * as vscode from 'vscode';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';
import { DatabricksJobTreeItem } from './DatabricksJobTreeItem';
import { DatabricksJobRun } from './DatabricksJobRun';
import { FSHelper } from '../../../helpers/FSHelper';

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

		super.tooltip = "Executed via 'dbutils.notebook.run()' or Submit REST API.";
		super.description = "(MANUALLY)";
		super.contextValue = "INTERACTIVE_JOBS";
	}

	protected  getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootPath, 'resources', theme, 'workspace', 'directory' + '.png');
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