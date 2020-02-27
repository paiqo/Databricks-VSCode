import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { JobTreeItemType, iDatabricksJobRun } from './_types';
import { iDatabricksJob } from './_types';
import { Helper } from '../../helpers/Helper';
import { ActiveDatabricksEnvironment } from '../../environments/ActiveDatabricksEnvironment';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksJobTreeItem extends vscode.TreeItem {
	private _type:	JobTreeItemType;
	private _job_id: number;
	private _jobDef: iDatabricksJob;

	private _job_run_id: number;
	private _jobRunDef: iDatabricksJobRun;
	
	private _name: string;
	private _definition: string;
	
	constructor(
		type: 	JobTreeItemType,
		definition: string
	) {
		super(type);

		this._type = type;
		this._definition = definition;

		if(type == "ROOT")
		{
			this._job_id = -1;
			this._jobDef = null;
			this._jobRunDef = null;
			this._name = '';
			
			super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		}
		else if (type == "JOB")
		{
			let jobDef: iDatabricksJob = JSON.parse(definition);

			this._job_id = jobDef.job_id;
			this._jobDef = jobDef;
			this._name = jobDef.settings.name;

			super.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		}
		else if (type == "JOB_RUN") 
		{
			let jobRunDef: iDatabricksJobRun = JSON.parse(definition);

			this._job_id = jobRunDef.job_id;
			this._job_run_id = jobRunDef.run_id;
			this._jobRunDef = jobRunDef;
			this._name = "Run " + jobRunDef.run_id;

			super.collapsibleState = undefined;
		}
		
		
		super.label = this._name;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get tooltip(): string {
		let ret: string;
		if (this.type == "JOB_RUN") {
			ret =  `${JSON.stringify(this.job_run_definition.state)})`;
		}
		if (this.type == "JOB") {
			ret = this.task_details;
		}
		return `(${ret})`;
	}

	// description is show next to the label
	get description(): string {
		if(this.type == "JOB_RUN")
		{
			return `(${this.job_run_definition.state.result_state || this.job_run_definition.state.life_cycle_state}), ${this.job_run_definition.creator_user_name}`;
		}
		if(this.type == "JOB")
		{
			if(this.job_definition.settings.schedule)
			{
				return `(${this.task_type}, ${this.job_definition.settings.schedule.quartz_cron_expression})`;
			}
			return `(MANUALLY)`;
		}
		return null;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		if(this.job_run_state == "running")
		{
			return "RUNNING_JOB";
		}
		return this.type;
	}

	private getIconPath(theme: string): string {
		let state: string = "job";
		
		if (this.contextValue == "JOB_RUN" || this.contextValue == "RUNNING_JOB")
		{
			state = this.job_run_state;
		}
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}

	readonly command = {
		command: 'databricksJobItem.click', title: "Open File", arguments: [this]
	};


	get type(): JobTreeItemType {
		return this._type;
	}

	get job_id(): number {
		return this._job_id;
	}

	get job_run_id(): number {
		return this._job_run_id;
	}

	get job_definition(): iDatabricksJob {
		return this._jobDef;
	}

	get job_run_definition(): iDatabricksJobRun {
		return this._jobRunDef;
	}

	get job_run_state(): string {
		if(this.type == "JOB_RUN")
		{
			if (this.job_run_definition.state.result_state == "SUCCESS") {
				return "succeeded";
			}
			else if (this.job_run_definition.state.result_state == "FAILED" 
				|| this.job_run_definition.state.result_state == "CANCELED"
				|| this.job_run_definition.state.result_state == "TIMEDOUT") {
				return "failed";
			}
			else {
				return "running";
			}
		}
		return "JOB";
	}

	get created_at(): number {
		if(this.type == "JOB")
		{
			return this.job_definition.created_time;
		}
		return this.job_run_definition.start_time;
	}

	get link(): string 
	{
		let link: string = `${ActiveDatabricksEnvironment.apiRootUrl}/?o=${ActiveDatabricksEnvironment.organizationId}#job/${this.job_id}`;
		if (this.type == "JOB") {
			return link;
		}
		else if (this.type == "JOB_RUN") {
			return link + "/run" + this.job_run_id;
		}
		return null;
	}

	get task_type(): string 
	{
		if(this.type == "JOB")
		{
			if (this.job_definition.settings.notebook_task) { return "Notebook"; }
			if (this.job_definition.settings.spark_jar_task) { return "JAR"; }
			if (this.job_definition.settings.spark_python_task) { return "Python"; }
			if (this.job_definition.settings.spark_submit_task) { return "Submit"; }
		}
		
		return "";
	}

	get task_details(): string
	{
		if (this.type == "JOB") {
			if (this.job_definition.settings.notebook_task) { return JSON.stringify(this.job_definition.settings.notebook_task); }
			if (this.job_definition.settings.spark_jar_task) { return JSON.stringify(this.job_definition.settings.spark_jar_task); }
			if (this.job_definition.settings.spark_python_task) { return JSON.stringify(this.job_definition.settings.spark_python_task); }
			if (this.job_definition.settings.spark_submit_task) { return JSON.stringify(this.job_definition.settings.spark_submit_task); }
		}
	}

	static fromJson(jsonString: string): DatabricksJobTreeItem {
		let item: iDatabricksJob = JSON.parse(jsonString);
		return new DatabricksJobTreeItem("JOB", jsonString);
	}

	getChildren(): Thenable<DatabricksJobTreeItem[]> {
		if (this.type === 'ROOT') {
			return this.getJobs();
		}
		else if (this.type === 'JOB') {
			return this.getJobRuns();
		}
		return null;
	}

	async getJobs(): Promise<DatabricksJobTreeItem[]> {
		let responseData = await DatabricksApiService.listJobs();
		// array of file is in result.files
		let items = responseData.jobs;

		let jobItems: DatabricksJobTreeItem[] = [];
		if (items != undefined) {
			items.map(item => jobItems.push(new DatabricksJobTreeItem("JOB", JSON.stringify(item))));
			Helper.sortArrayByProperty(jobItems, "label", "ASC");
		}

		return jobItems;
	}

	async getJobRuns(): Promise<DatabricksJobTreeItem[]> {
		let responseData = await DatabricksApiService.listJobRuns(this.job_id);
		// array of file is in result.files
		let items = responseData.runs;

		let jobItems: DatabricksJobTreeItem[] = [];
		if (items != undefined) {
			items.map(item => jobItems.push(new DatabricksJobTreeItem("JOB_RUN", JSON.stringify(item))));
			Helper.sortArrayByProperty(jobItems, "created_at", "DESC");
		}

		return jobItems;
	}

	async start(): Promise<void> {
		if(this.type == "JOB")
		{
			let response = DatabricksApiService.runJob(this.job_id);

			response.then((response) => {
				vscode.window.showInformationMessage(`Starting job ${this.label} (${this.job_id}) ...`);
			}, (error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			});
		}

		await Helper.wait(2000);
		vscode.commands.executeCommand("databricksJobs.refresh", false);
	}

	async stop(): Promise<void> {
		if (this.type == "JOB_RUN") {
			let response = DatabricksApiService.cancelJunJob(this.job_run_id);

			response.then((response) => {
				vscode.window.showInformationMessage(`Stopping job run ${this.label} (${this.job_run_id}) ...`);
			}, (error) => {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			});
		}

		await Helper.wait(10000);
		vscode.commands.executeCommand("databricksJobs.refresh", false);
	}

	async delete(): Promise<void> {
		vscode.window.showErrorMessage(`Not yet implemented!`);
	}

	async showDefinition(): Promise<void> {
		if(this.type == "JOB")
		{
			await Helper.openTempFile(JSON.stringify(this.job_definition, null, "\t"), this.label + '-' + this.job_id + '.json');
		}
		else
		{
			await Helper.openTempFile(JSON.stringify(this.job_run_definition, null, "\t"), this.label + '-' + this.job_run_id + '.json');
		}
	}

	async openBrowser(): Promise<void> {
		await Helper.openLink(this.link);
	}

	async click(): Promise<void> {
		await Helper.singleVsDoubleClick(this, this.singleClick, this.doubleClick);
	}

	async doubleClick(): Promise<void> {
		await this.showDefinition();
	}

	async singleClick(): Promise<void> {}
}