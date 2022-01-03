'use strict';

import * as vscode from 'vscode';
import { ThisExtension } from './ThisExtension';

import { DatabricksConnectionTreeProvider } from './vscode/treeviews/connections/DatabricksConnectionTreeProvider';
import { DatabricksConnectionTreeItem } from './vscode/treeviews/connections/DatabricksConnectionTreeItem';
import { DatabricksWorkspaceTreeProvider } from './vscode/treeviews/workspaces/DatabricksWorkspaceTreeProvider';
import { DatabricksClusterTreeProvider } from './vscode/treeviews/clusters/DatabricksClusterTreeProvider';
import { DatabricksClusterTreeItem } from './vscode/treeviews/clusters/DatabricksClusterTreeItem';
import { DatabricksJobTreeProvider } from './vscode/treeviews/jobs/DatabricksJobTreeProvider';
import { DatabricksJobTreeItem } from './vscode/treeviews/jobs/DatabricksJobTreeItem';
import { DatabricksFSTreeProvider } from './vscode/treeviews/dbfs/DatabricksFSTreeProvider';
import { DatabricksSecretTreeProvider } from './vscode/treeviews/secrets/DatabricksSecretTreeProvider';
import { DatabricksSecretTreeItem } from './vscode/treeviews/secrets/DatabricksSecretTreeItem';
import { DatabricksWorkspaceNotebook } from './vscode/treeviews/workspaces/DatabricksWorkspaceNotebook';
import { DatabricksWorkspaceDirectory } from './vscode/treeviews/workspaces/DatabricksWorkspaceDirectory';
import { DatabricksFSFile } from './vscode/treeviews/dbfs/DatabricksFSFile';
import { DatabricksFSDirectory } from './vscode/treeviews/dbfs/DatabricksFSDirectory';
import { DatabricksJob } from './vscode/treeviews/jobs/DatabricksJob';
import { DatabricksJobRun } from './vscode/treeviews/jobs/DatabricksJobRun';
import { DatabricksSQLTreeProvider } from './vscode/treeviews/sql/DatabricksSQLTreeProvider';
import { DatabricksSQLTable } from './vscode/treeviews/sql/DatabricksSQLTable';
import { DatabricksRepoTreeProvider } from './vscode/treeviews/repos/DatabricksRepoTreeProvider';
import { DatabricksRepoTreeItem } from './vscode/treeviews/repos/DatabricksRepoTreeItem';


export async function activate(context: vscode.ExtensionContext) {

	let isValidated: boolean = await ThisExtension.initialize(context);
	if (!isValidated) {
		ThisExtension.log("Issue initializing extension - Please update Databricks settings and restart VSCode!");
		vscode.window.showErrorMessage("Issue initializing extension - Please update Databricks settings and restart VSCode!");
	}

	// register DatabricksConnectionTreeProvider
	let databricksConnectionTreeProvider = new DatabricksConnectionTreeProvider();
	vscode.window.registerTreeDataProvider('DatabricksConnections', databricksConnectionTreeProvider);
	vscode.commands.registerCommand('databricksConnections.refresh', (showInfoMessage: boolean = true) => databricksConnectionTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('DatabricksConnections.add', () => databricksConnectionTreeProvider.add());

	vscode.commands.registerCommand('DatabricksConnectionItem.activate', (connection: DatabricksConnectionTreeItem) => connection.activate());

	// register DatabricksWorkspaceTreeProvider
	let databricksWorkspaceTreeProvider = new DatabricksWorkspaceTreeProvider();
	vscode.window.registerTreeDataProvider('databricksWorkspace', databricksWorkspaceTreeProvider);
	vscode.commands.registerCommand('databricksWorkspace.refresh', (showInfoMessage: boolean = true) => databricksWorkspaceTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksWorkspace.download', () => databricksWorkspaceTreeProvider.download());
	vscode.commands.registerCommand('databricksWorkspace.upload', () => databricksWorkspaceTreeProvider.upload());

	vscode.commands.registerCommand('databricksWorkspaceItem.click', (workspaceItem: DatabricksWorkspaceNotebook) => workspaceItem.click());
	vscode.commands.registerCommand('databricksWorkspaceItem.download', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.download());
	vscode.commands.registerCommand('databricksWorkspaceItem.upload', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.upload());
	vscode.commands.registerCommand('databricksWorkspaceItem.compare', (workspaceItem: DatabricksWorkspaceNotebook) => workspaceItem.compare());

	vscode.commands.registerCommand('databricksWorkspaceItem.edit', (workspaceItem: DatabricksWorkspaceNotebook) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksWorkspaceItem.delete', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksWorkspaceItem.sync', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => vscode.window.showErrorMessage(`Not yet implemented!`));


	// register DatabricksClusterTreeProvider
	let databricksClusterTreeProvider = new DatabricksClusterTreeProvider();
	vscode.window.registerTreeDataProvider('databricksClusters', databricksClusterTreeProvider);
	vscode.commands.registerCommand('databricksClusters.refresh', (showInfoMessage: boolean = true) => databricksClusterTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksClusters.add', () => databricksClusterTreeProvider.add());

	vscode.commands.registerCommand('databricksClusterItem.click', (cluster: DatabricksClusterTreeItem) => cluster.click());
	vscode.commands.registerCommand('databricksClusterItem.start', (cluster: DatabricksClusterTreeItem) => cluster.start());
	vscode.commands.registerCommand('databricksClusterItem.stop', (cluster: DatabricksClusterTreeItem) => cluster.stop());
	vscode.commands.registerCommand('databricksClusterItem.showDefinition', (cluster: DatabricksClusterTreeItem) => cluster.showDefinition());
	vscode.commands.registerCommand('databricksClusterItem.delete', (cluster: DatabricksClusterTreeItem) => cluster.delete());
	vscode.commands.registerCommand('databricksClusterItem.useForSQL', (cluster: DatabricksClusterTreeItem) => cluster.useForSQL());

	
	databricksClusterTreeProvider.autoRefresh();

	// register DatabricksJobsTreeProvider
	let databricksJobsTreeProvider = new DatabricksJobTreeProvider();
	vscode.window.registerTreeDataProvider('databricksJobs', databricksJobsTreeProvider);
	vscode.commands.registerCommand('databricksJobs.refresh', (showInfoMessage: boolean = true) => databricksJobsTreeProvider.refresh(showInfoMessage));

	vscode.commands.registerCommand('databricksJobItem.click', (job: DatabricksJobTreeItem) => job.click());
	vscode.commands.registerCommand('databricksJobItem.showDefinition', (job: DatabricksJobTreeItem) => job.showDefinition());
	vscode.commands.registerCommand('databricksJobItem.start', (job: DatabricksJob) => job.start());
	vscode.commands.registerCommand('databricksJobItem.stop', (job_run: DatabricksJobRun) => job_run.stop());
	vscode.commands.registerCommand('databricksJobItem.openBrowser', (job: DatabricksJobTreeItem) => job.openBrowser());

	databricksJobsTreeProvider.autoRefresh();

	// register DatabricksFSTreeProvider
	let databricksFSTreeProvider = new DatabricksFSTreeProvider();
	vscode.window.registerTreeDataProvider('databricksFS', databricksFSTreeProvider);
	vscode.commands.registerCommand('databricksFS.refresh', (showInfoMessage: boolean = true) => databricksFSTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksFS.add', () => new DatabricksFSDirectory("/", "Online").add());

	vscode.commands.registerCommand('databricksFSItem.click', (fsItem: DatabricksFSFile) => fsItem.click());
	vscode.commands.registerCommand('databricksFSItem.add', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.add());
	vscode.commands.registerCommand('databricksFSItem.download', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.download());
	vscode.commands.registerCommand('databricksFSItem.upload', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.upload());
	vscode.commands.registerCommand('databricksFSItem.delete', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.delete());


	// register DatabricksSecretTreeProvider
	let databricksSecretTreeProvider = new DatabricksSecretTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSecrets', databricksSecretTreeProvider);
	vscode.commands.registerCommand('databricksSecrets.refresh', (showInfoMessage: boolean = true) => databricksSecretTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksSecrets.addSecretScope', () => databricksSecretTreeProvider.addSecretScope());

	vscode.commands.registerCommand('databricksSecretItem.deleteSecretScope', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecretScope());
	vscode.commands.registerCommand('databricksSecretItem.addSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.addSecret());
	vscode.commands.registerCommand('databricksSecretItem.updateSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.updateSecret());
	vscode.commands.registerCommand('databricksSecretItem.deleteSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecret());

	// register DatabricksSQLTreeProvider
	let databricksSQLTreeProvider = new DatabricksSQLTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSQL', databricksSQLTreeProvider);
	vscode.commands.registerCommand('databricksSQL.refresh', (showInfoMessage: boolean = true) => databricksSQLTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksSQLTable.showDefinition', (sqlTable: DatabricksSQLTable) => sqlTable.showDefinition());

	// register DatabricksRepoProvider
	let databricksRepoTreeProvider = new DatabricksRepoTreeProvider();
	vscode.window.registerTreeDataProvider('databricksRepos', databricksRepoTreeProvider);
	vscode.commands.registerCommand('databricksRepos.refresh', (showInfoMessage: boolean = true) => databricksRepoTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksRepo.checkOut', (repo: DatabricksRepoTreeItem) => repo.checkOut());
	vscode.commands.registerCommand('databricksRepo.delete', (repo: DatabricksRepoTreeItem) => repo.delete());
	
}


export function deactivate() {
	ThisExtension.cleanUp();
}