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
import { FSHelper } from './helpers/FSHelper';
import { DatabricksKernelManager } from './vscode/notebook/DatabricksKernelManager';
import { DatabricksSQLTreeItem } from './vscode/treeviews/sql/DatabricksSQLTreeItem';
import { DatabricksSecretTreeItem } from './vscode/treeviews/secrets/DatabricksSecretTreeItem';
import { DatabricksNotebookSerializer } from './vscode/notebook/DatabricksNotebookSerializer';
import { DatabricksSendToAPI } from './vscode/editors/DatabricksSendToAPI';

export async function activate(context: vscode.ExtensionContext) {

	// some of the following code needs the context before the initialization already
	ThisExtension.extensionContext = context;

	ThisExtension.Logger = vscode.window.createOutputChannel(context.extension.id);
	ThisExtension.log("Logger initialized!");

	if(ThisExtension.isInBrowser)
	{
		let msg: string = "As the Databricks API does not yet fully support CORS, running as a web extension is still quite limited!";
		vscode.window.showWarningMessage(msg);
		ThisExtension.log(msg);
	}

	ThisExtension.StatusBar = vscode.window.createStatusBarItem("databricks-vscode", vscode.StatusBarAlignment.Right);
	ThisExtension.StatusBar.show();
	
	let notebookSerializer = new DatabricksNotebookSerializer(context);
	
	vscode.commands.registerCommand('databricksKernel.restart',
		(notebook: { notebookEditor: { notebookUri: vscode.Uri } } | undefined | vscode.Uri) => DatabricksKernelManager.restartJupyterKernel(notebook)
	);
	vscode.commands.registerCommand('databricksKernel.updateWidgets',
		(notebook: { notebookEditor: { notebookUri: vscode.Uri } } | undefined | vscode.Uri) => DatabricksKernelManager.updateWidgets(notebook)
	);

	// register Editor Buttons
	vscode.commands.registerCommand('databricksApi.sendToApi',
		DatabricksSendToAPI.sendToAPI
	);

	// register DatabricksConnectionTreeProvider
	let databricksConnectionTreeProvider = new DatabricksConnectionTreeProvider();
	vscode.window.registerTreeDataProvider('databricksConnections', databricksConnectionTreeProvider);
	vscode.commands.registerCommand('databricksConnections.refresh', (item: DatabricksConnectionTreeItem, showInfoMessage: boolean = true) => databricksConnectionTreeProvider.refresh(item, showInfoMessage));
	if (ThisExtension.isInBrowser) {
		vscode.commands.registerCommand('databricksConnections.add', () => databricksConnectionTreeProvider.add());
	}
	else {
		vscode.commands.registerCommand('databricksConnections.settings', () => databricksConnectionTreeProvider.openSettings());
	}
	vscode.commands.registerCommand('databricksConnectionItem.activate', (connection: DatabricksConnectionTreeItem) => connection.activate());

	// register DatabricksWorkspaceTreeProvider
	if (!ThisExtension.isInBrowser) {
		let databricksWorkspaceTreeProvider = new DatabricksWorkspaceTreeProvider(context);
		//vscode.window.registerTreeDataProvider('databricksWorkspace', databricksWorkspaceTreeProvider);
		vscode.commands.registerCommand('databricksWorkspace.refresh', (item: DatabricksWorkspaceTreeItem, showInfoMessage: boolean = true) => databricksWorkspaceTreeProvider.refresh(item, showInfoMessage));
		vscode.commands.registerCommand('databricksWorkspace.download', () => databricksWorkspaceTreeProvider.download());
		vscode.commands.registerCommand('databricksWorkspace.upload', () => databricksWorkspaceTreeProvider.upload());

		vscode.commands.registerCommand('databricksWorkspaceItem.click', (workspaceItem: DatabricksWorkspaceNotebook) => workspaceItem.click());
		vscode.commands.registerCommand('databricksWorkspaceItem.download', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.download());
		vscode.commands.registerCommand('databricksWorkspaceItem.upload', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.upload());
		vscode.commands.registerCommand('databricksWorkspaceItem.compare', (workspaceItem: DatabricksWorkspaceNotebook) => workspaceItem.compare());
		vscode.commands.registerCommand('databricksWorkspaceItem.copyPath', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.copyPathToClipboard());
		vscode.commands.registerCommand('databricksWorkspaceItem.openExplorer', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.openExplorer());
		vscode.commands.registerCommand('databricksWorkspaceItem.delete', (workspaceItem: DatabricksWorkspaceNotebook | DatabricksWorkspaceDirectory) => workspaceItem.delete());
	}
	// Workspace File System Provider
	const workspaceProvider = new DatabricksWorkspaceProvider(context);
	vscode.commands.registerCommand('databricksWorkspace.addToWorkspace', (showMessage: boolean) => {
		FSHelper.addToWorkspace(vscode.Uri.parse(ThisExtension.WORKSPACE_SCHEME +':/'), "Databricks - Workspace", showMessage);
	});

	if (ThisExtension.isInBrowser) {
		// in a virtual workspace we always want to add the WSFS/DBWS mount to the workspace
		vscode.commands.executeCommand('databricksWorkspace.addToWorkspace', false);
	}


	// register DatabricksClusterTreeProvider
	let databricksClusterTreeProvider = new DatabricksClusterTreeProvider(context);
	//vscode.window.registerTreeDataProvider('databricksClusters', databricksClusterTreeProvider);
	vscode.commands.registerCommand('databricksClusters.refresh', (item: DatabricksClusterTreeItem, showInfoMessage: boolean = true, isAutoRefresh: boolean = false) => databricksClusterTreeProvider.refresh(showInfoMessage, isAutoRefresh, item));
	vscode.commands.registerCommand('databricksClusters.add', () => databricksClusterTreeProvider.add());

	vscode.commands.registerCommand('databricksClusterItem.start', (cluster: DatabricksCluster) => cluster.start());
	vscode.commands.registerCommand('databricksClusterItem.stop', (cluster: DatabricksCluster) => cluster.stop());
	vscode.commands.registerCommand('databricksClusterItem.showDefinition', (cluster: DatabricksCluster) => cluster.showDefinition());
	vscode.commands.registerCommand('databricksClusterItem.delete', (cluster: DatabricksCluster) => cluster.delete());
	vscode.commands.registerCommand('databricksClusterItem.pin', (cluster: DatabricksCluster) => cluster.pin());
	vscode.commands.registerCommand('databricksClusterItem.unpin', (cluster: DatabricksCluster) => cluster.unpin());
	vscode.commands.registerCommand('databricksClusterItem.useForSQL', (cluster: DatabricksCluster) => cluster.useForSQL());
	vscode.commands.registerCommand('databricksClusterItem.createKernel', (cluster: DatabricksCluster) => cluster.createKernel());
	vscode.commands.registerCommand('databricksClusterItem.restartKernel', (cluster: DatabricksCluster) => cluster.restartKernel());

	// set cluster for Databricks Extension
	vscode.commands.registerCommand('databricksClusterItem.attachCluster', (cluster: DatabricksCluster) => cluster.attachCluster());


	// register DatabricksJobsTreeProvider
	let databricksJobsTreeProvider = new DatabricksJobTreeProvider(context);
	//vscode.window.registerTreeDataProvider('databricksJobs', databricksJobsTreeProvider);
	vscode.commands.registerCommand('databricksJobs.refresh', (item: DatabricksJobTreeItem, showInfoMessage: boolean = true) => databricksJobsTreeProvider.refresh(showInfoMessage, false, item));

	vscode.commands.registerCommand('databricksJobItem.click', (job: DatabricksJobTreeItem) => job.click());
	vscode.commands.registerCommand('databricksJobItem.showDefinition', (job: DatabricksJobTreeItem) => job.showDefinition());
	vscode.commands.registerCommand('databricksJobItem.start', (job: DatabricksJob) => job.start());
	vscode.commands.registerCommand('databricksJobItem.stop', (job_run: DatabricksJobRun) => job_run.stop());
	vscode.commands.registerCommand('databricksJobItem.openBrowser', (job: DatabricksJobTreeItem) => job.openBrowser());


	// register DatabricksFSTreeProvider
	if (!ThisExtension.isInBrowser) {
		let databricksFSTreeProvider = new DatabricksFSTreeProvider(context);
		//vscode.window.registerTreeDataProvider('databricksFS', databricksFSTreeProvider);
		vscode.commands.registerCommand('databricksFS.refresh', (item: DatabricksFSDirectory = null, showInfoMessage: boolean = true) => databricksFSTreeProvider.refresh(showInfoMessage, item));
		vscode.commands.registerCommand('databricksFS.addFile', () => new DatabricksFSDirectory("/", "Online", null, null).addFile());
		vscode.commands.registerCommand('databricksFS.addDirectory', () => new DatabricksFSDirectory("/", "Online", null, null).addDirectory());

		vscode.commands.registerCommand('databricksFSItem.click', (fsItem: DatabricksFSFile) => fsItem.click());
		vscode.commands.registerCommand('databricksFSItem.addFile', (fsItem: DatabricksFSDirectory) => fsItem.addFile());
		vscode.commands.registerCommand('databricksFSItem.addDirectory', (fsItem: DatabricksFSDirectory) => fsItem.addDirectory());
		vscode.commands.registerCommand('databricksFSItem.download', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.download());
		vscode.commands.registerCommand('databricksFSItem.upload', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.upload());
		vscode.commands.registerCommand('databricksFSItem.delete', (fsItem: DatabricksFSFile | DatabricksFSDirectory) => fsItem.delete());
		vscode.commands.registerCommand('databricksFSItem.copyPath', (fsItem: DatabricksFSTreeItem) => fsItem.CopyPathToClipboard());
	}
	// DBFS File System Provider
	const dbfsProvider = new DatabricksFileSystemProvider(context);
	vscode.commands.registerCommand('databricksFS.addToWorkspace', (showMessage: boolean) => {
		FSHelper.addToWorkspace(vscode.Uri.parse(ThisExtension.DBFS_SCHEME + ':/'), "Databricks - DBFS", showMessage);
	});

	if (ThisExtension.isInBrowser) {
		// in a virtual workspace we always want to add the DBFS mount to the workspace
		vscode.commands.executeCommand('databricksFS.addToWorkspace', false);
	}


	// register DatabricksSecretTreeProvider
	let databricksSecretTreeProvider = new DatabricksSecretTreeProvider(context);
	//vscode.window.registerTreeDataProvider('databricksSecrets', databricksSecretTreeProvider);
	vscode.commands.registerCommand('databricksSecrets.refresh', (item: DatabricksSecretTreeItem = null, showInfoMessage: boolean = true) => databricksSecretTreeProvider.refresh(item, showInfoMessage));
	vscode.commands.registerCommand('databricksSecrets.addSecretScope', () => databricksSecretTreeProvider.addSecretScope());
	vscode.commands.registerCommand('databricksSecretScope.delete', (scope: DatabricksSecretScope) => scope.delete());
	vscode.commands.registerCommand('databricksSecretScope.addSecret', (scope: DatabricksSecretScope) => scope.addSecret());
	vscode.commands.registerCommand('databricksSecret.update', (secret: DatabricksSecret) => secret.update());
	vscode.commands.registerCommand('databricksSecret.delete', (secret: DatabricksSecret) => secret.delete());
	vscode.commands.registerCommand('databricksSecret.insertCode', (scope: DatabricksSecret) => scope.insertCode(scope));

	// register DatabricksSQLTreeProvider
	let databricksSQLTreeProvider = new DatabricksSQLTreeProvider(context);
	//vscode.window.registerTreeDataProvider('databricksSQL', databricksSQLTreeProvider);
	vscode.commands.registerCommand('databricksSQL.refresh', (item: DatabricksSQLTreeItem = null, showInfoMessage: boolean = true) => databricksSQLTreeProvider.refresh(showInfoMessage, item));
	vscode.commands.registerCommand('databricksSQLTable.showDefinition', (sqlTable: DatabricksSQLTable) => sqlTable.showDefinition());

	// register DatabricksRepoProvider
	let databricksRepoTreeProvider = new DatabricksRepoTreeProvider(context);
	//vscode.window.registerTreeDataProvider('databricksRepos', databricksRepoTreeProvider);
	vscode.commands.registerCommand('databricksRepos.refresh', (item: DatabricksRepoTreeItem = null, showInfoMessage: boolean = true) => databricksRepoTreeProvider.refresh(showInfoMessage, item));
	vscode.commands.registerCommand('databricksRepo.checkOut', (repo: DatabricksRepoRepository) => repo.checkOut());
	vscode.commands.registerCommand('databricksRepo.pull', (repo: DatabricksRepoRepository) => repo.pull());
	vscode.commands.registerCommand('databricksRepo.delete', (repo: DatabricksRepoRepository) => repo.delete());


	vscode.commands.registerCommand('databricksPowerTools.initialize', async () => {
		ThisExtension.setStatusBar("Initializing ...", true);

		let isValidated: boolean = await ThisExtension.initialize(context);
		if (isValidated === false) {
			const msg = "Issue initializing extension - Please update Databricks settings and restart VSCode!"
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);

			ThisExtension.setStatusBar("ERROR!");

			throw new Error(msg);
		}
		//vscode.commands.executeCommand('databricksConnections.refresh');
		
		ThisExtension.setStatusBar("Initialized!");
		DatabricksKernelManager.initialize();
	}
	);

	vscode.commands.executeCommand('databricksPowerTools.initialize');
}


export function deactivate() {
	ThisExtension.dispose();
}