import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { ClusterState } from './_types';
import { iDatabricksCluster } from './iDatabricksCluster';
import { iDatabricksRuntimeVersion } from './iDatabricksRuntimeVersion';
import { Helper } from '../../helpers/Helper';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksClusterTreeItem extends vscode.TreeItem implements iDatabricksCluster {
	private _id: string;
	private _name: string;
	private _state: ClusterState;
	private _definition: string;
	
	constructor(
		definition: string,
		cluster_id: string,
		cluster_name: string,
		cluster_state: ClusterState,
	) {
		super(cluster_name);
		this._definition = definition;
		this._id = cluster_id;
		this._name = cluster_name;
		this._state = cluster_state;

		// clusters are never expandable
		super.collapsibleState = undefined;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get tooltip(): string {
		return `${this.cluster_id} (${this.state})`;
	}

	// description is show next to the label
	get description(): string {
		return `${this.cluster_id} (${this.state})`;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		if(['RUNNING', 'ERROR', 'UNKNOWN', 'PENDING'].includes(this.state))
		{
			return 'CAN_STOP';
		}
		if(['UNKNOWN', 'RESTARTING', 'RESIZING', 'TERMINATING','TERMINATED'].includes(this.state))
		{
			return 'CAN_START';
		}
	}

	private getIconPath(theme: string): string {
		let state = (this.contextValue == "CAN_START" ? 'stop' : 'start');
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.svg');
	}


	get definition (): string {
		return this._definition;
	}

	get cluster_name (): string {
		return this._name;
	}

	get cluster_id (): string {
		return this._id;
	}

	get state (): ClusterState {
		if(this._state == undefined)
		{
			return "UNKNOWN";
		}
		return this._state;
	}

	static fromJson(jsonString: string): DatabricksClusterTreeItem {
		let item: iDatabricksCluster = JSON.parse(jsonString);
		return new DatabricksClusterTreeItem(jsonString, item.cluster_id, item.cluster_name, item.state);
	}

	start(): void {
		let response = DatabricksApiService.startCluster(this.cluster_id);

		response.then((response) => {
			vscode.window.showInformationMessage(`Starting cluster ${this.label} (${this.cluster_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		Helper.wait(5000);
		vscode.commands.executeCommand("databricksClusters.refresh", false);
	}

	stop(): void {
		let response = DatabricksApiService.stopCluster(this.cluster_id);

		response.then((response) => {
			vscode.window.showInformationMessage(`Stopping cluster ${this.label} (${this.cluster_id}) ...`);
		}, (error) => {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		});

		Helper.wait(5000);
		vscode.commands.executeCommand("databricksClusters.refresh", false);
	}

	showDefinition(): void {
		Helper.openTempFile(this._definition, this.cluster_name + '.json');
	}

	get(): void {

	}
}