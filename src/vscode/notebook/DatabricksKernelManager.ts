import * as vscode from 'vscode';

import { ThisExtension } from '../../ThisExtension';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { iDatabricksCluster } from '../treeviews/clusters/iDatabricksCluster';
import { DatabricksKernel } from './DatabricksKernel';


export abstract class DatabricksKernelManager {
	private static JupyterKernelSuffix: string = "-jupyter-notebook";
	private static DatabricksKernelSuffix: string = "-databricks-notebook";

	private static _kernels: Map<string, DatabricksKernel> = new Map<string, DatabricksKernel>();

	static async initialize(): Promise<void> {
		this.refresh(false);
		this.autoRefresh(300);
	}

	static async refresh(showInfoMessage: boolean = false): Promise<void> {
		let clusters: iDatabricksCluster[] = await DatabricksApiService.listClusters();

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

	static async autoRefresh(timeoutSeconds: number = 10) {
		while (true) {
			await new Promise(resolve => setTimeout(resolve, timeoutSeconds * 1000));

			this.refresh(false);
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

	static async createKernels(cluster: iDatabricksCluster, logMessages: boolean = true): Promise<void> {
		if (!this.jupyterKernelExists(cluster)) {
			let notebookKernel: DatabricksKernel = new DatabricksKernel(cluster);
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
			let interactiveKernel: DatabricksKernel = new DatabricksKernel(cluster, "databricks-notebook");
			this.setKernel(this.getDatabricksKernelName(cluster), interactiveKernel);
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
				ThisExtension.log(`Interactive Kernel for Databricks cluster '${cluster.cluster_id}' removed!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Interactive Kernel for Databricks cluster '${cluster.cluster_id}' does not exists!`)
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