'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';
import { ThisExtension } from './ThisExtension';
import { Helper } from './helpers/Helper';

import { DatabricksApiService } from './databricksApi/databricksApiService';
import { DatabricksEnvironmentTreeProvider } from './DatabricksEnvironmentTreeProvider';
import { DatabricksEnvironmentTreeItem } from './environments/DatabricksEnvironmentTreeItem';
import { ActiveDatabricksEnvironment } from './environments/ActiveDatabricksEnvironment';
import { DatabricksWorkspaceTreeProvider } from './DatabricksWorkspaceTreeProvider';
import { DatabricksWorkspaceTreeItem } from './databricksApi/workspaces/DatabricksWorkspaceTreeItem';
import { DatabricksClusterTreeProvider } from './DatabricksClusterTreeProvider';
import { DatabricksClusterTreeItem } from './databricksApi/clusters/DatabricksClusterTreeItem';
import { DatabricksJobTreeProvider } from './DatabricksJobTreeProvider';
import { DatabricksJobTreeItem } from './databricksApi/jobs/DatabricksJobTreeItem';
import { DatabricksFSTreeProvider } from './DatabricksFSTreeProvider';
import { DatabricksFSTreeItem } from './databricksApi/dbfs/DatabricksFSTreeItem';
import { DatabricksSecretTreeProvider } from './DatabricksSecretTreeProvider';
import { DatabricksSecretTreeItem } from './databricksApi/secrets/DatabricksSecretTreeItem';
import { iDatabricksEnvironment } from './environments/iDatabricksEnvironment';

export function activate(context: vscode.ExtensionContext) {

	ThisExtension.initialize(context);
	if(!ThisExtension.IsValidated)
	{
		vscode.window.showErrorMessage("Please update Databricks settings and restart VSCode!");
	}

	DatabricksApiService.initialize();

	// register DatabricksEnvironmentTreeProvider
	let databricksEnvironmentTreeProvider = new DatabricksEnvironmentTreeProvider();
	vscode.window.registerTreeDataProvider('databricksEnvironments', databricksEnvironmentTreeProvider);
	vscode.commands.registerCommand('databricksEnvironments.refresh', (showInfoMessage: boolean = true) => databricksEnvironmentTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksEnvironments.add', () => databricksEnvironmentTreeProvider.add());

	vscode.commands.registerCommand('databricksEnvironmentItem.activate', (envItem: DatabricksEnvironmentTreeItem) => envItem.activate());
		
	// register DatabricksWorkspaceTreeProvider
	let databricksWorkspaceTreeProvider = new DatabricksWorkspaceTreeProvider();
	vscode.window.registerTreeDataProvider('databricksWorkspace', databricksWorkspaceTreeProvider);
	vscode.commands.registerCommand('databricksWorkspace.refresh', (showInfoMessage: boolean = true) => databricksWorkspaceTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksWorkspace.download', () => databricksWorkspaceTreeProvider.download());
	vscode.commands.registerCommand('databricksWorkspace.upload', () => databricksWorkspaceTreeProvider.upload());

	vscode.commands.registerCommand('databricksWorkspaceItem.click', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.click());
	vscode.commands.registerCommand('databricksWorkspaceItem.download', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.download());
	vscode.commands.registerCommand('databricksWorkspaceItem.upload', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.upload());
	
	vscode.commands.registerCommand('databricksWorkspaceItem.edit', (workspaceItem: DatabricksWorkspaceTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksWorkspaceItem.delete', (workspaceItem: DatabricksWorkspaceTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksWorkspaceItem.sync', (workspaceItem: DatabricksWorkspaceTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	

	// register DatabricksWorkspaceTreeProvider
	let databricksClusterTreeProvider = new DatabricksClusterTreeProvider();
	vscode.window.registerTreeDataProvider('databricksClusters', databricksClusterTreeProvider);
	vscode.commands.registerCommand('databricksClusters.refresh', (showInfoMessage: boolean = true) => databricksClusterTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksClusters.add', () => databricksClusterTreeProvider.add());
	
	vscode.commands.registerCommand('databricksClusterItem.click', (cluster: DatabricksClusterTreeItem) => cluster.click());
	vscode.commands.registerCommand('databricksClusterItem.start', (cluster: DatabricksClusterTreeItem) => cluster.start());
	vscode.commands.registerCommand('databricksClusterItem.stop', (cluster: DatabricksClusterTreeItem) => cluster.stop());
	vscode.commands.registerCommand('databricksClusterItem.showDefinition', (cluster: DatabricksClusterTreeItem) => cluster.showDefinition());
	vscode.commands.registerCommand('databricksClusterItem.delete', (cluster: DatabricksClusterTreeItem) => cluster.delete());


	// register DatabricksJobsTreeProvider
	let databricksJobsTreeProvider = new DatabricksJobTreeProvider();
	vscode.window.registerTreeDataProvider('databricksJobs', databricksJobsTreeProvider);
	vscode.commands.registerCommand('databricksJobs.refresh', (showInfoMessage: boolean = true) => databricksJobsTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksJobs.add', () => databricksJobsTreeProvider.add());

	vscode.commands.registerCommand('databricksJobItem.click', (job: DatabricksJobTreeItem) => job.click());
	vscode.commands.registerCommand('databricksJobItem.showDefinition', (job: DatabricksJobTreeItem) => job.showDefinition());
	vscode.commands.registerCommand('databricksJobItem.start', (job: DatabricksJobTreeItem) => job.start());
	vscode.commands.registerCommand('databricksJobItem.stop', (job_run: DatabricksJobTreeItem) => job_run.stop());
	vscode.commands.registerCommand('databricksJobItem.openBrowser', (job: DatabricksJobTreeItem) => job.openBrowser());
	vscode.commands.registerCommand('databricksJobItem.delete', (job: DatabricksJobTreeItem) => job.delete());

	// register DatabricksFSTreeProvider
	let databricksFSTreeProvider = new DatabricksFSTreeProvider();
	vscode.window.registerTreeDataProvider('databricksFS', databricksFSTreeProvider);
	vscode.commands.registerCommand('databricksFS.refresh', (showInfoMessage: boolean = true) => databricksFSTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksFS.add', () => new DatabricksFSTreeItem("/", true, 0).add());

	vscode.commands.registerCommand('databricksFSItem.click', (fsItem: DatabricksFSTreeItem) => fsItem.download("PREVIEW"));
	vscode.commands.registerCommand('databricksFSItem.add', (fsItem: DatabricksFSTreeItem) => fsItem.add());
	vscode.commands.registerCommand('databricksFSItem.download', (fsItem: DatabricksFSTreeItem) => fsItem.download("SAVE"));
	vscode.commands.registerCommand('databricksFSItem.delete', (fsItem: DatabricksFSTreeItem) => fsItem.delete());
	
	
	// register DatabricksSecretTreeProvider
	let databricksSecretTreeProvider = new DatabricksSecretTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSecrets', databricksSecretTreeProvider);
	vscode.commands.registerCommand('databricksSecrets.refresh', (showInfoMessage: boolean = true) => databricksSecretTreeProvider.refresh(showInfoMessage));
	vscode.commands.registerCommand('databricksSecrets.addSecretScope', () => databricksSecretTreeProvider.addSecretScope());

	vscode.commands.registerCommand('databricksSecretItem.deleteSecretScope', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecretScope());
	vscode.commands.registerCommand('databricksSecretItem.addSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.addSecret());
	vscode.commands.registerCommand('databricksSecretItem.deleteSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecret());
}


export function deactivate() {
	Helper.removeTempFiles();
}