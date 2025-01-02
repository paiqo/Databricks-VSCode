import * as vscode from 'vscode';

import { ThisExtension } from '../../ThisExtension';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { iDatabricksCluster } from '../treeviews/clusters/iDatabricksCluster';
import { DatabricksKernel } from './DatabricksKernel';


export abstract class DatabricksKernelManager {
	private static JupyterKernelSuffix: string = "-jupyter-notebook";
	private static DatabricksKernelSuffix: string = "-databricks-notebook";
	private static InteractiveKernelSuffix: string = "-databricks.interactive";

	private static _kernels: Map<string, DatabricksKernel> = new Map<string, DatabricksKernel>();

	private static _autoRefreshTimer;

	static async initialize(): Promise<void> {
		ThisExtension.setStatusBar("Initializing Kernels ...", true);

		this.refresh(false);
		this.startAutoRefresh(300); // refresh every 5 minutes

		ThisExtension.setStatusBar("Kernels initialized!");
	}

	static async startAutoRefresh(timeoutSeconds: number): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('AutoRefresh for KernelManager is already running!');
		}
		else {
			ThisExtension.log(`Starting AutoRefresh for KernelManager every ${timeoutSeconds} seconds!`);
			this._autoRefreshTimer = setInterval(async () => {
				await this.refresh(false);
			}, timeoutSeconds * 1000);
		}

	}

	static async stopAutoRefresh(): Promise<void> {
		if (this._autoRefreshTimer) {
			ThisExtension.log('Stopping AutoRefresh for KernelManager!');
			clearInterval(this._autoRefreshTimer);
			this._autoRefreshTimer = undefined;
		}
		else {
			ThisExtension.log('AutoRefresh for KernelManager is not running!');
		}
	}

	static async refresh(showInfoMessage: boolean = false): Promise<void> {
		let clusters: iDatabricksCluster[] = await DatabricksApiService.listClusters() ?? [];

		for (let cluster of clusters) {
			if (cluster.cluster_source != "JOB") {
				if (cluster.state == "RUNNING") {
					DatabricksKernelManager.createKernels(cluster, showInfoMessage);
				}
				else {
					DatabricksKernelManager.removeKernels(cluster, showInfoMessage);
				}
			}
		}
	}

	static setKernel(kernelName: string, kernel: DatabricksKernel): void {
		if (!this._kernels.has(kernelName)) {
			this._kernels.set(kernelName, kernel);
		}
	}

	static removeKernel(kernelName: string): void {
		if (this._kernels.has(kernelName)) {
			let kernel: DatabricksKernel = this.getKernel(kernelName);
			kernel.dispose();
		}
	}

	static getKernel(kernelName: string): DatabricksKernel {
		return this._kernels.get(kernelName);
	}

	static getJupyterKernelName(cluster: iDatabricksCluster): string {
		return (cluster.kernel_id ?? cluster.cluster_id) + DatabricksKernelManager.JupyterKernelSuffix;
	}

	static getJupyterKernel(cluster: iDatabricksCluster): DatabricksKernel {
		return this.getKernel(this.getJupyterKernelName(cluster));
	}

	static jupyterKernelExists(cluster: iDatabricksCluster): boolean {
		if (this.getKernel(this.getJupyterKernelName(cluster))) {
			return true;
		}
		return false;
	}

	static getDatabricksKernelName(cluster: iDatabricksCluster): string {
		return cluster.cluster_id + DatabricksKernelManager.DatabricksKernelSuffix
	}

	static getDatabricksKernel(cluster: iDatabricksCluster): DatabricksKernel {
		return this.getKernel(this.getDatabricksKernelName(cluster));
	}

	static databricksKernelExists(cluster: iDatabricksCluster): boolean {
		if (this.getDatabricksKernel(cluster)) {
			return true;
		}
		return false;
	}

	static getInteractiveKernelName(cluster: iDatabricksCluster): string {
		return cluster.cluster_id + DatabricksKernelManager.InteractiveKernelSuffix;
	}

	static getInteractiveKernel(cluster: iDatabricksCluster): DatabricksKernel {
		return this.getKernel(this.getInteractiveKernelName(cluster));
	}

	static interactiveKernelExists(cluster: iDatabricksCluster): boolean {
		if (this.getInteractiveKernel(cluster)) {
			return true;
		}
		return false;
	}

	static async createKernels(cluster: iDatabricksCluster, logMessages: boolean = true): Promise<void> {
		if (!this.jupyterKernelExists(cluster)) {
			let notebookKernel: DatabricksKernel = new DatabricksKernel(cluster, "jupyter-notebook");
			this.setKernel(this.getJupyterKernelName(cluster), notebookKernel);
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' created!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' already exists!`)
			}
		}

		if (!this.databricksKernelExists(cluster)) {
			let databricksKernel: DatabricksKernel = new DatabricksKernel(cluster, "databricks-notebook");
			this.setKernel(this.getDatabricksKernelName(cluster), databricksKernel);
			if (logMessages) {
				ThisExtension.log(`Databricks Kernel for Databricks cluster '${cluster.cluster_id}' created!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Databricks Kernel for Databricks cluster '${cluster.cluster_id}' already exists!`)
			}
		}

		if (!this.interactiveKernelExists(cluster)) {
			let interactiveKernel: DatabricksKernel = new DatabricksKernel(cluster, "interactive");
			this.setKernel(this.getInteractiveKernelName(cluster), interactiveKernel);
			if (logMessages) {
				ThisExtension.log(`Interactive Kernel for Databricks cluster '${cluster.cluster_id}' created!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Interactive Kernel for Databricks cluster '${cluster.cluster_id}' already exists!`)
			}
		}
	}

	static async removeKernels(cluster: iDatabricksCluster, logMessages: boolean = true): Promise<void> {
		if (this.jupyterKernelExists(cluster)) {
			this.removeKernel(this.getJupyterKernelName(cluster));
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' removed!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' does not exists!`)
			}
		}

		if (this.databricksKernelExists(cluster)) {
			this.removeKernel(this.getDatabricksKernelName(cluster));
			if (logMessages) {
				ThisExtension.log(`Databricks Kernel for Databricks cluster '${cluster.cluster_id}' removed!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Databricks Kernel for Databricks cluster '${cluster.cluster_id}' does not exists!`)
			}
		}
	}

	static async restartClusterKernel(cluster: iDatabricksCluster): Promise<void> {
		let kernel: DatabricksKernel = this.getJupyterKernel(cluster)
		if (kernel) {
			kernel.restart();
		}
	}

	static async restartJupyterKernel(notebook: { notebookEditor: { notebookUri: vscode.Uri } } | undefined | vscode.Uri): Promise<void> {
		let notebookUri: vscode.Uri = undefined;

		ThisExtension.setStatusBar("Restarting Jupyter Kernel ...", true);

		if (notebook instanceof vscode.Uri) {
			notebookUri = notebook;
		}
		else if ((notebook as any).notebookEditor.notebookUri) {
			notebookUri = (notebook as any).notebookEditor.notebookUri;
		}

		for (let kernel of this._kernels.values()) {
			kernel.restart(notebookUri);
		}

		ThisExtension.setStatusBar("Jupyter Kernel restarted!");
	}

	static async updateWidgets(notebook: { notebookEditor: { notebookUri: vscode.Uri } } | undefined | vscode.Uri): Promise<void> {
		let notebookUri: vscode.Uri = undefined;

		if (notebook instanceof vscode.Uri) {
			notebookUri = notebook;
		}
		else if ((notebook as any).notebookEditor.notebookUri) {
			notebookUri = (notebook as any).notebookEditor.notebookUri;
		}

		for (let kernel of this._kernels.values()) {
			kernel.updateWidgets(notebookUri);
		}
	}
}