import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksJobTreeItem } from './DatabricksJobTreeItem';
import { DatabricksJobRun } from './DatabricksJobRun';
import { iDatabricksJob } from './iDatabricksJob';
import { FSHelper } from '../../../helpers/FSHelper';
import { iDatabricksJobRun } from './iDatabricksJobRun';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksJob extends DatabricksJobTreeItem {
	
	constructor(
		definition: iDatabricksJob
	) {
		super("JOB", definition.job_id, definition.settings.name, definition, vscode.TreeItemCollapsibleState.Collapsed);

		super.label = this.name;
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get _tooltip(): string {
		return JSON.stringify(this.definition.settings, null, 4);
	}

	// description is show next to the label
	get _description(): string {
		let description: string = `(MANUALLY)`;
		if (this.definition.settings.schedule) {
			description = `(${this.definition.settings.schedule.pause_status}, ${this.definition.settings.schedule.quartz_cron_expression}`;
		}
		description = `${description}, ${this.task_type})`;
		return description;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return this.type;
	}

	protected  getIconPath(theme: string): vscode.Uri {
		let state: string = "job";

		return FSHelper.joinPathSync(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}

	readonly command = {
		command: 'databricksJobItem.click', title: "Open File", arguments: [this]
	};


	get job_id(): number {
		return super.databricks_id;
	}

	get definition(): iDatabricksJob {
		return this._definition as iDatabricksJob;
	}

	get created_at(): number {
		return this.definition.created_time;
	}

	get link(): string {
		let actConn = ThisExtension.ActiveConnection;
		let link: string = Helper.trimChar(FSHelper.joinPathSync(actConn.apiRootUrl, "?#job", this.job_id.toString()).toString(true), '/');
		
		return link;
	}

	get task_type(): string {
		if (this.definition.settings.tasks.length == 1)
		{
			if (this.definition.settings.tasks[0].notebook_task) { return "Notebook"; }
			if (this.definition.settings.tasks[0].spark_jar_task) { return "JAR"; }
			if (this.definition.settings.tasks[0].spark_python_task) { return "Python"; }
			if (this.definition.settings.tasks[0].spark_submit_task) { return "Submit"; }
		}
		return this.definition.settings.format;
	}

	public static fromInterface(item: iDatabricksJob): DatabricksJob {
		return new DatabricksJob(item);
	}

	public static fromJSON(itemDefinition: string): DatabricksJob {
		let item: iDatabricksJob = JSON.parse(itemDefinition);
		return DatabricksJob.fromInterface(item);
	}

	async getChildren(): Promise<DatabricksJobRun[]> {
		let response: iDatabricksJobRun[] = await DatabricksApiService.listJobRuns(this.job_id);
		// array of file is in result.files
		let items = response;

		let jobItems: DatabricksJobRun[] = [];
		if (items) {
			items.map(item => jobItems.push(DatabricksJobRun.fromJSON(JSON.stringify(item))));
			Helper.sortArrayByProperty(jobItems, "start_time", "DESC");
		}

		return jobItems;
	}

	async start(): Promise<void> {
		let response = DatabricksApiService.runJob(this.job_id);

		response.then((response) => {
			Helper.showTemporaryInformationMessage(`Starting job ${this.label} (${this.job_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		setTimeout(() => vscode.commands.executeCommand("databricksJobs.refresh", false), 2000);
	}
}