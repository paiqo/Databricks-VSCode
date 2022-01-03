import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';
import { DatabricksJobTreeItem } from './DatabricksJobTreeItem';
import { iDatabricksJobRun } from './iDatabricksJobRun';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksJobRun extends DatabricksJobTreeItem {

	constructor(
		definition: iDatabricksJobRun
	) {
		super("JOB_RUN", definition.run_id, definition.run_name, definition, vscode.TreeItemCollapsibleState.None);

		super.label = `${new Date(this.start_time).toISOString().substr(0, 19).replace('T', ' ')}`;
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get _tooltip(): string {
		let tooltip: string = "";

		let startDate = new Date(this.start_time);
		
		// tooltip = tooltip + "Started: " + Helper.trimChar(startDate.toISOString().split('T')[1], "T") + " UTC\n";

		tooltip = tooltip + `Duration: ${this.duration}`; 
		if(this.state == "succeeded")
		{
			tooltip = tooltip + ""; 
		}
		else
		{
			tooltip = tooltip + " (running)"; 
		}
		tooltip = tooltip + `\nrun_id: ${this.job_run_id}`; 
		tooltip = tooltip + `\n${this.task_details}`;

		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		let state = this.definition.state;
		return `(${state.result_state || state.life_cycle_state}) ${this.duration} - ${this.task_description}`;
	}

	// used in package.json to filter commands via viewItem == RUNNING_JOB
	get _contextValue(): string {
		if (this.state == "running") {
			return "RUNNING_JOB";
		}
		return this.type;
	}

	protected getIconPath(theme: string): string {
		let state: string = this.state;

		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}

	readonly command = {
		command: 'databricksJobItem.click', title: "Open File", arguments: [this]
	};



	get job_id(): number {
		return this.definition.job_id;
	}

	get job_run_id(): number {
		return this.definition.run_id;
	}

	get definition(): iDatabricksJobRun {
		return this._definition as iDatabricksJobRun;
	}

	get state(): string {
		if (this.definition.state.result_state == "SUCCESS") {
			return "succeeded";
		}
		else if (this.definition.state.result_state == "FAILED"
			|| this.definition.state.result_state == "CANCELED"
			|| this.definition.state.result_state == "TIMEDOUT") {
			return "failed";
		}
		else {
			return "running";
		}
	}

	get start_time(): number {
		return this.definition.start_time;
	}

	get duration(): string {
		let startDate = new Date(this.definition.start_time);
		let endDate = new Date(Date.now());

		if(this.state == "succeeded")
		{
			endDate = new Date(this.definition.start_time + this.definition.setup_duration + this.definition.execution_duration + this.definition.cleanup_duration);	
		}

		let duration = (endDate.getTime() - startDate.getTime()) / 1000;

		return Helper.secondsToHms(duration);
	}

	get link(): string {
		return this.definition.run_page_url;
	}

	get task_type(): string {
		if (this.definition.task.notebook_task) { return "Notebook"; }
		if (this.definition.task.spark_jar_task) { return "JAR"; }
		if (this.definition.task.spark_python_task) { return "Python"; }
		if (this.definition.task.spark_submit_task) { return "Submit"; }
	}

	get task_description(): string {
		if (this.definition.task.notebook_task) { 
			return "Notebook: " + this.definition.task.notebook_task.notebook_path;
		}
		if (this.definition.task.spark_jar_task) { 
			return "JAR: " + this.definition.task.spark_jar_task.jar_uri + " - " + this.definition.task.spark_jar_task.main_class_name;
		}
		if (this.definition.task.spark_python_task) { 
			return "Python: " + this.definition.task.spark_python_task.python_file;
		}
		if (this.definition.task.spark_submit_task) { 
			return "Spark-Submit: " + this.definition.task.spark_submit_task.parameters.join(' '); 
		}
	}

	get task_details(): string {
		if (this.definition.task.notebook_task) { 
			return `Notebook: ${this.definition.task.notebook_task.notebook_path}\nRevision Timestamp: ${this.definition.task.notebook_task.revision_timestamp}\nParameters: ${JSON.stringify(this.definition.task.notebook_task.base_parameters)}`;
		}
		if (this.definition.task.spark_jar_task) { 
			return `JAR: ${this.definition.task.spark_jar_task.jar_uri}\nMain Class: ${this.definition.task.spark_jar_task.main_class_name}\nParameters: ${this.definition.task.spark_jar_task.parameters.join(' ')}`;
		}
		if (this.definition.task.spark_python_task) { 
			return `Python: ${this.definition.task.spark_python_task.python_file}\nParameters: ${this.definition.task.spark_python_task.parameters.join(' ')}`;
		}
		if (this.definition.task.spark_submit_task) { 
			return "Spark-Submit: " + this.definition.task.spark_submit_task.parameters.join(' '); 
		}
	}

	
	public static fromInterface(item: iDatabricksJobRun): DatabricksJobRun {
		return new DatabricksJobRun(item);
	}

	public static fromJSON(itemDefinition: string): DatabricksJobRun {
		let item: iDatabricksJobRun = JSON.parse(itemDefinition);
		let ret = DatabricksJobRun.fromInterface(item);
		return ret;
	}

	async stop(): Promise<void> {
		let response = DatabricksApiService.cancelJunJob(this.job_run_id);

		response.then((response) => {
			vscode.window.showInformationMessage(`Stopping job run ${this.label} (${this.job_run_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		setTimeout(() => vscode.commands.executeCommand("databricksJobs.refresh", false), 10000);
	}
}