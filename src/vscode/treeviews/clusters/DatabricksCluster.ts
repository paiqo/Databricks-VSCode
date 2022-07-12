import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { ClusterState, ClusterSource } from './_types';
import { iDatabricksCluster } from './iDatabricksCluster';
import { Helper } from '../../../helpers/Helper';
import { DatabricksNotebookKernel } from '../../notebook/DatabricksNotebookKernel';
import { DatabricksClusterTreeItem } from './DatabricksClusterTreeItem';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksCluster extends DatabricksClusterTreeItem {
	private _id: string;
	private _state: ClusterState;
	private _definition: iDatabricksCluster;
	private _source: ClusterSource;
	private _notebook_kernel: DatabricksNotebookKernel;

	constructor(
		definition: iDatabricksCluster,
		parent: DatabricksClusterTreeItem = null
	) {
		super("CLUSTER", definition.cluster_name, parent, vscode.TreeItemCollapsibleState.None);
		this._definition = definition;
		this._id = definition.cluster_id;
		this._state = definition.state;
		this._source = definition.cluster_source;

		super.description = this._description;
		super.tooltip = this._tooltip;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get _tooltip(): string {
		let tooltip =  `NodeType: ${this.definition.node_type_id}\n` + 
				`DriverNodeType: ${this.definition.driver_node_type_id}\n` + 
				`SparkVersion: ${this.definition.spark_version}\n` + 
				`AutoTermination: ${this.definition.autotermination_minutes} minutes\n`;

		if(this.definition.num_workers != undefined)
		{
			tooltip += `Num Workers: ${this.definition.num_workers}\n`;
		}
		else if(this.definition.autoscale != undefined)
		{
			tooltip += `AutoScale: ${this.definition.autoscale.min_workers} - ${this.definition.autoscale.max_workers} workers\n`;
		}

		return tooltip.trim();
	}

	// description is show next to the label
	get _description(): string {
		let desc: string = this.cluster_id;

		if (this.definition.custom_tags != undefined && this.definition.custom_tags.ResourceClass != undefined) {
			if (this.definition.custom_tags.ResourceClass == "Serverless") {
				desc += " (High-Concurrency, ";
			}
			else if (this.definition.custom_tags.ResourceClass == "SingleNode") {
				desc += " (SingleNode, ";
			}
			else {
				desc += " (Standard, ";
			}
		}
		else {
			desc += " (Standard, ";
		}
		return desc + this.state + ")";
	}

	// used in package.json to filter commands via viewItem == ACTIVE
	get _contextValue(): string {
		if (['RUNNING', 'ERROR', 'UNKNOWN', 'PENDING'].includes(this.state)) {
			return 'CAN_STOP';
		}
		if (['UNKNOWN', 'RESTARTING', 'RESIZING', 'TERMINATING', 'TERMINATED'].includes(this.state)) {
			return 'CAN_START';
		}
	}

	private getIconPath(theme: string): string {
		let state = (this.contextValue == "CAN_START" ? 'stop' : 'start');
		if (this.state == "PENDING") { 
			state = "pending"; 
		}
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}

	readonly command = {
		command: 'databricksClusterItem.click', title: "Open File", arguments: [this]
	};


	get definition(): iDatabricksCluster {
		return this._definition;
	}

	get cluster_name(): string {
		return this.name;
	}

	get cluster_id(): string {
		return this._id;
	}

	get state(): ClusterState {
		if (this._state == undefined) {
			return "UNKNOWN";
		}
		return this._state;
	}

	get cluster_source(): ClusterSource {
		return this._source;
	}

	private get NotebookKernel(): DatabricksNotebookKernel {
		return this._notebook_kernel;
	}

	private set NotebookKernel(value: DatabricksNotebookKernel) {
		this._notebook_kernel = value;
	}

	async getChildren(): Promise<DatabricksClusterTreeItem[]> {
		return [];
	}

	static fromJson(jsonString: string): DatabricksClusterTreeItem {
		let item: iDatabricksCluster = JSON.parse(jsonString);
		return new DatabricksCluster(item);
	}

	async start(): Promise<void> {
		let response = DatabricksApiService.startCluster(this.cluster_id);

		response.then((response) => {
			vscode.window.showInformationMessage(`Starting cluster ${this.label} (${this.cluster_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		setTimeout(() => vscode.commands.executeCommand("databricksClusters.refresh", false), 1000);
	}

	async stop(): Promise<void> {
		let response = DatabricksApiService.stopCluster(this.cluster_id);

		response.then((response) => {
			vscode.window.showInformationMessage(`Stopping cluster ${this.label} (${this.cluster_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		if(this.NotebookKernel)
		{
			this.NotebookKernel.disposeController();
		}

		setTimeout(() => vscode.commands.executeCommand("databricksClusters.refresh", false), 1000);
	}

	async delete(): Promise<void> {
		vscode.window.showErrorMessage(`Not yet implemented!`);

		setTimeout(() => vscode.commands.executeCommand("databricksClusters.refresh", false), 1000);
	}

	async showDefinition(): Promise<void> {
		await Helper.openTempFile(JSON.stringify(this.definition, null, "\t"), this.cluster_name + '.json');
	}

	async useForSQL(): Promise<void> {
		ThisExtension.SQLClusterID = this.cluster_id;

		if(ThisExtension.DisposableExists(DatabricksNotebookKernel.getId(this.cluster_id))) {
			ThisExtension.log("Notebook Kernel for Cluster '" + this.cluster_id + "' has already already exists - recreating it!");
			ThisExtension.RemoveDisposable(DatabricksNotebookKernel.getId(this.cluster_id));

			await Helper.delay(500);
		}

		this.NotebookKernel = new DatabricksNotebookKernel(this.cluster_id, this.cluster_name);

		setTimeout(() => vscode.commands.executeCommand("databricksSQL.refresh", false), 1000);
	}

	async restartKernel(): Promise<void> {
		if(this.NotebookKernel)
		{
			this.NotebookKernel.restart();
		}
	}

	async interruptKernel(): Promise<void> {
		if(this.NotebookKernel)
		{
			this.NotebookKernel.interrupt();
		}
	}
}