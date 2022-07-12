import * as vscode from 'vscode';
import * as fspath from 'path';

import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksCluster } from './iDatabricksCluster';
import { DatabricksClusterTreeItem } from './DatabricksClusterTreeItem';
import { DatabricksCluster } from './DatabricksCluster';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksClusterJobClusters extends DatabricksClusterTreeItem {

	constructor() {
		super("JOB_CLUSTER_DIR", "Job Clusters", null, vscode.TreeItemCollapsibleState.Collapsed);

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	private getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, "workspace", "directory" + '.png');
	}

	async getChildren(): Promise<DatabricksClusterTreeItem[]> {
		let clusters: iDatabricksCluster[] = await DatabricksApiService.listClusters();
		let items: DatabricksClusterTreeItem[] = [];

		
			for (let cluster of clusters) {
				if (["JOB"].includes(cluster.cluster_source)) {
					items.push(new DatabricksCluster(cluster));
				}
			}

		return items;
	}
}