'use strict';

import * as vscode from 'vscode';
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
import { DatabricksFSTreeProvider } from './DatabricksFSTreeProvider';
import { DatabricksFSTreeItem } from './databricksApi/dbfs/DatabricksFSTreeItem';
import { DatabricksSecretTreeProvider } from './DatabricksSecretTreeProvider';
import { DatabricksSecretTreeItem } from './databricksApi/secrets/DatabricksSecretTreeItem';

export function activate(context: vscode.ExtensionContext) {

	ThisExtension.initialize(context);
	DatabricksApiService.initialize();

	// register DatabricksEnvironmentTreeProvider
	let databricksEnvironmentTreeProvider = new DatabricksEnvironmentTreeProvider();
	vscode.window.registerTreeDataProvider('databricksEnvironments', databricksEnvironmentTreeProvider);
	vscode.commands.registerCommand('databricksEnvironments.refresh', () => databricksEnvironmentTreeProvider.refresh());

	vscode.commands.registerCommand('databricksEnvironmentItem.activate', (envItem: DatabricksEnvironmentTreeItem) => envItem.activate());
		
	// register DatabricksWorkspaceTreeProvider
	let databricksWorkspaceTreeProvider = new DatabricksWorkspaceTreeProvider();
	vscode.window.registerTreeDataProvider('databricksWorkspace', databricksWorkspaceTreeProvider);
	vscode.commands.registerCommand('databricksWorkspace.refresh', () => databricksWorkspaceTreeProvider.refresh());
	vscode.commands.registerCommand('databricksWorkspace.download', () => databricksWorkspaceTreeProvider.download());
	vscode.commands.registerCommand('databricksWorkspace.upload', () => databricksWorkspaceTreeProvider.upload());

	vscode.commands.registerCommand('databricksWorkspaceItem.open', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.open());
	vscode.commands.registerCommand('databricksWorkspaceItem.download', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.download());
	vscode.commands.registerCommand('databricksWorkspaceItem.upload', (workspaceItem: DatabricksWorkspaceTreeItem) => workspaceItem.upload());
	
	vscode.commands.registerCommand('databricksWorkspaceItem.edit', (workspaceItem: DatabricksWorkspaceTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksWorkspaceItem.delete', (workspaceItem: DatabricksWorkspaceTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	

	// register DatabricksWorkspaceTreeProvider
	let databricksClusterTreeProvider = new DatabricksClusterTreeProvider();
	vscode.window.registerTreeDataProvider('databricksClusters', databricksClusterTreeProvider);
	vscode.commands.registerCommand('databricksClusters.refresh', () => databricksClusterTreeProvider.refresh());
	vscode.commands.registerCommand('databricksClusters.addCluster', () => vscode.window.showErrorMessage(`Not yet implemented!`));
	
	vscode.commands.registerCommand('databricksClusterItem.start', (cluster: DatabricksClusterTreeItem) => cluster.start());
	vscode.commands.registerCommand('databricksClusterItem.stop', (cluster: DatabricksClusterTreeItem) => cluster.stop());
	vscode.commands.registerCommand('databricksClusterItem.edit', (cluster: DatabricksClusterTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));
	vscode.commands.registerCommand('databricksClusterItem.delete', (cluster: DatabricksClusterTreeItem) => vscode.window.showErrorMessage(`Not yet implemented!`));


	// register DatabricksFSTreeProvider
	let databricksFSTreeProvider = new DatabricksFSTreeProvider();
	vscode.window.registerTreeDataProvider('databricksFS', databricksFSTreeProvider);
	vscode.commands.registerCommand('databricksFS.refresh', () => databricksFSTreeProvider.refresh());

	vscode.commands.registerCommand('databricksFSItem.download', (fsItem: DatabricksFSTreeItem) => fsItem.download(ActiveDatabricksEnvironment.localSyncFolder));
	
	
	// register DatabricksSecretTreeProvider
	let databricksSecretTreeProvider = new DatabricksSecretTreeProvider();
	vscode.window.registerTreeDataProvider('databricksSecrets', databricksSecretTreeProvider);
	vscode.commands.registerCommand('databricksSecrets.refresh', () => databricksSecretTreeProvider.refresh());
	vscode.commands.registerCommand('databricksSecrets.addSecretScope', () => databricksSecretTreeProvider.addSecretScope());

	vscode.commands.registerCommand('databricksSecretItem.deleteSecretScope', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecretScope());
	vscode.commands.registerCommand('databricksSecretItem.addSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.addSecret());
	vscode.commands.registerCommand('databricksSecretItem.deleteSecret', (secretItem: DatabricksSecretTreeItem) => secretItem.deleteSecret());
	
}