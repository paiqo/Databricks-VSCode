import * as vscode from 'vscode';

import { ThisExtension } from '../../ThisExtension';
import { ContextLanguage, ExecutionContext } from '../../databricksApi/_types';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { Helper } from '../../helpers/Helper';
import { iDatabricksCluster } from '../treeviews/clusters/iDatabricksCluster';
import { DatabricksKernel } from './DatabricksKernel';


export abstract class DatabricksKernelManager  {
	private static NotebookKernelSuffix: string = "-jupyter-notebook";
	private static InteractiveKernelSuffix: string = "-interactive";

	private static _kernels: Map<string, DatabricksKernel> = new Map<string, DatabricksKernel>();

	static async initialize(): Promise<void> {
		let clusters: iDatabricksCluster[] = await DatabricksApiService.listClusters();

		for(let cluster of clusters)
		{
			if (cluster.state == "RUNNING") {
				DatabricksKernelManager.createKernel(cluster);
			}
		}
	}

	static setKernel(kernelName: string, kernel: DatabricksKernel): void {
		if(!(kernelName in this._kernels.keys))
		{
			this._kernels[kernelName] = kernel;
		}
	}

	static getKernel(kernelName: string): DatabricksKernel {
		return this._kernels[kernelName];
	}

	static getNotebookKernelName(cluster: iDatabricksCluster): string {
		return cluster.cluster_id + DatabricksKernelManager.NotebookKernelSuffix;
	}

	static getNotebookKernel(cluster: iDatabricksCluster): DatabricksKernel {
		return this.getKernel(this.getNotebookKernelName(cluster));
	}

	static notebookKernelExists(cluster: iDatabricksCluster): boolean {
		if (this.getKernel(this.getNotebookKernelName(cluster))) {
			return true;
		}
		return false;
	}

	static getInteractiveKernelName(cluster: iDatabricksCluster): string {
		return cluster.cluster_id + DatabricksKernelManager.InteractiveKernelSuffix
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

	static async createKernel(cluster: iDatabricksCluster, logMessages: boolean = true): Promise<void> {
		if (!this.notebookKernelExists(cluster)) {
			let notebookKernel: DatabricksKernel = new DatabricksKernel(cluster.cluster_id, cluster.cluster_name);
			this.setKernel(this.getNotebookKernelName(cluster), notebookKernel);
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' created!`)
			}
		}
		else {
			if (logMessages) {
				ThisExtension.log(`Notebook Kernel for Databricks cluster '${cluster.cluster_id}' already exists!`)
			}
		}

		if (!this.interactiveKernelExists(cluster)) {
			let interactiveKernel: DatabricksKernel = new DatabricksKernel(cluster.cluster_id, cluster.cluster_name, "interactive");
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

	static async restartNotebookKernel(cluster: iDatabricksCluster): Promise<void> {
		let kernel: DatabricksKernel = this.getNotebookKernel(cluster)
		if (kernel) {
			kernel.restart();
		}
	}
}