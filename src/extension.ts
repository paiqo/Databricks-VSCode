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
import { DatabricksFSTreeItem } from './vscode/treeviews/dbfs/DatabricksFSTreeItem';
import { DatabricksWorkspaceTreeItem } from './vscode/treeviews/workspaces/DatabricksWorkspaceTreeItem';
import { DatabricksRepoRepository } from './vscode/treeviews/repos/DatabricksRepoRepository';
import { DatabricksCluster } from './vscode/treeviews/clusters/DatabricksCluster';
import { DatabricksSecretScope } from './vscode/treeviews/secrets/DatabricksSecretScope';
import { DatabricksSecret } from './vscode/treeviews/secrets/DatabricksSecret';
import { DatabricksFileSystemProvider } from './vscode/filesystemProvider/DatabricksFileSystemProvider';
import { DatabricksWorkspaceProvider } from './vscode/filesystemProvider/DatabricksWorkspaceProvider';
import { DatabricksRepoTreeItem } from './vscode/treeviews/repos/DatabricksRepoTreeItem';

export async function activate(context: vscode.ExtensionContext) {

	ThisExtension.StatusBar = vscode.window.createStatusBarItem("databricks-vscode", vscode.StatusBarAlignment.Right);
	ThisExtension.StatusBar.show();
	ThisExtension.setStatusBar("Initializing ...");

	let isValidated: boolean = await ThisExtension.initialize(context);
	if (!isValidated) {
		ThisExtension.log("Issue initializing extension - Please update Databricks settings and restart VSCode!");
		vscode.window.showErrorMessage("Issue initializing extension - Please update Databricks settings and restart VSCode!");
	}

	ThisExtension.setStatusBar("Initialized!");

	const workspaceProvider = new DatabricksWorkspaceProvider();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('dbws', workspaceProvider, { isCaseSensitive: true }));
	vscode.commands.registerCommand('databricksWorkspace.addToWorkspace', _ => {
		vscode.window.showWarningMessage("This feature is still experimental!");
		// add at the end of the workspace
		vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders.length, 0, { uri: vscode.Uri.parse('dbws:/'), name: "Databricks - Workspace" });
	});

	vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders.length, 0, { uri: vscode.Uri.parse('dbws:/'), name: "Databricks - Workspace" });
	

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
	vscode.commands.registerCommand('databricksWorkspaceItem.copyPath', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.CopyPathToClipboard());

	vscode.commands.registerCommand('databricksWorkspaceItem.delete', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.delete());

	// register DatabricksClusterTreeProvider
	let databricksClusterTreeProvider = new DatabricksClusterTreeProvider();
	vscode.window.registerTreeDataProvider('databricksClusters', databricksClusterTreeProvider);
	vscode.commands.registerCommand('databricksClusters.refresh', (showInfoMessage: boolean = true, isAutoRefresh: boolean = false, item: DatabricksClusterTreeItem = null) => databricksClusterTreeProvider.refresh(showInfoMessage, isAutoRefresh, item));
	vscode.commands.registerCommand('databricksClusters.add', () => databricksClusterTreeProvider.add());

	vscode.commands.registerCommand('databricksClusterItem.start', (cluster: DatabricksCluster) => cluster.start());
	vscode.commands.registerCommand('databricksClusterItem.stop', (cluster: DatabricksCluster) => cluster.stop());
	vscode.commands.registerCommand('databricksClusterItem.showDefinition', (cluster: DatabricksCluster) => cluster.showDefinition());
	vscode.commands.registerCommand('databricksClusterItem.delete', (cluster: DatabricksCluster) => cluster.delete());
	vscode.commands.registerCommand('databricksClusterItem.useForSQL', (cluster: DatabricksCluster) => cluster.useForSQL());
	vscode.commands.registerCommand('databricksClusterItem.createKernel', (cluster: DatabricksCluster) => cluster.createKernel());
	vscode.commands.registerCommand('databricksClusterItem.restartKernel', (cluster: DatabricksCluster) => cluster.restartKernel());

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
	vscode.commands.registerCommand('databricksFS.refresh', (showInfoMessage: boolean = true, item: DatabricksFSDirectory = null) => databricksFSTreeProvider.refresh(showInfoMessage, item));
	vscode.commands.registerCommand('databricksFS.addFile', () => new DatabricksFSDirectory("/", "Online", null, null).addFile());
	vscode.commands.registerCommand('databricksFS.addDirectory', () => new DatabricksFSDirectory("/", "Online", null, null).addDirectory());

	vscode.commands.registerCommand('databricksFSItem.click', (fsItem: DatabricksFSFile) => fsItem.click());
	vscode.commands.registerCommand('databricksFSItem.addFile', (fsItem: DatabricksFSDirectory) => fsItem.addFile());
	vscode.commands.registerCommand('databricksFSItem.addDirectory', (fsItem: DatabricksFSDirectory) => fsItem.addDirectory());
	vscode.commands.registerCommand('databricksFSItem.download', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.download());
	vscode.commands.registerCommand('databricksFSItem.upload', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.upload());
	vscode.commands.registerCommand('databricksFSItem.delete', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.delete());
	vscode.commands.registerCommand('databricksFSItem.copyPath', (fsItem: DatabricksFSTreeItem) => fsItem.CopyPathToClipboard());

	// DBFS File System Provider
	const dbfsProvider = new DatabricksFileSystemProvider();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('dbfs', dbfsProvider, { isCaseSensitive: true }));
	vscode.commands.registerCommand('databricksFS.addToWorkspace', _ => {
		vscode.window.showWarningMessage("This feature is still experimental!");
		// add at the end of the workspace
		vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders.length, 0, { uri: vscode.Uri.parse('dbfs:/'), name: "Databricks - DBFS" });
	});

	// register DatabricksSecretTreeProvider
	let databricksSecretTreeProvider = new DatabricksSecretTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSecrets', databricksSecretTreeProvider);
	vscode.commands.registerCommand('databricksSecrets.refresh', (showInfoMessage: boolean = true) => databricksSecretTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksSecrets.addSecretScope', () => databricksSecretTreeProvider.addSecretScope());
	vscode.commands.registerCommand('databricksSecretScope.delete', (scope: DatabricksSecretScope) => scope.delete());
	vscode.commands.registerCommand('databricksSecretScope.addSecret', (scope: DatabricksSecretScope) => scope.addSecret());
	vscode.commands.registerCommand('databricksSecret.update', (secret: DatabricksSecret) => secret.update());
	vscode.commands.registerCommand('databricksSecret.delete', (secret: DatabricksSecret) => secret.delete());

	// register DatabricksSQLTreeProvider
	let databricksSQLTreeProvider = new DatabricksSQLTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSQL', databricksSQLTreeProvider);
	vscode.commands.registerCommand('databricksSQL.refresh', (showInfoMessage: boolean = true) => databricksSQLTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksSQLTable.showDefinition', (sqlTable: DatabricksSQLTable) => sqlTable.showDefinition());

	// register DatabricksRepoProvider
	let databricksRepoTreeProvider = new DatabricksRepoTreeProvider();
	vscode.window.registerTreeDataProvider('databricksRepos', databricksRepoTreeProvider);
	vscode.commands.registerCommand('databricksRepos.refresh', (showInfoMessage: boolean = true, item: DatabricksRepoTreeItem = null) => databricksRepoTreeProvider.refresh(showInfoMessage, item));
	vscode.commands.registerCommand('databricksRepo.checkOut', (repo: DatabricksRepoRepository) => repo.checkOut());
	vscode.commands.registerCommand('databricksRepo.pull', (repo: DatabricksRepoRepository) => repo.pull());
	vscode.commands.registerCommand('databricksRepo.delete', (repo: DatabricksRepoRepository) => repo.delete());


	// register DatabricksNotebook Commands
	vscode.commands.registerCommand('databricksNotebook.new', async function () {
		const newNotebook = await vscode.workspace.openNotebookDocument('jupyter-notebook', new vscode.NotebookData(
			[new vscode.NotebookCellData(vscode.NotebookCellKind.Code, '/Hello{1,7} Notebooks/', 'plaintext')]
		));

		await vscode.commands.executeCommand('vscode.open', newNotebook.uri);
	});
}


export function deactivate() {
	ThisExtension.dispose();
}