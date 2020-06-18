import * as vscode from 'vscode';
import { DatabricksConnectionTreeItem } from './connections/DatabricksConnectionTreeItem';
import { Helper } from './helpers/Helper';
import { ThisExtension } from './ThisExtension';
import { DatabricksConnection } from './connections/DatabricksConnection';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksConnectionTreeProvider implements vscode.TreeDataProvider<DatabricksConnectionTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksConnectionTreeItem | undefined> = new vscode.EventEmitter<DatabricksConnectionTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksConnectionTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(showInfoMessage: boolean = false): void {
		if (showInfoMessage) {
			vscode.window.showInformationMessage('Refreshing Connections ...');
		}
		ThisExtension.ConnectionManager.loadConnections();
		ThisExtension.ConnectionManager.activateConnection(ThisExtension.ActiveConnectionName);
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: DatabricksConnectionTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksConnectionTreeItem): Thenable<DatabricksConnectionTreeItem[]> {
		// array of file is in result.files
		let items: DatabricksConnection[] = ThisExtension.ConnectionManager.Connections;

		let envItems: DatabricksConnectionTreeItem[] = [];

		for (let i = 0; i < items.length; i++) {
			let item = items[i];

			envItems.push(new DatabricksConnectionTreeItem(
				item.displayName,
				item.cloudProvider,
				item.personalAccessToken,
				item.apiRootUrl,
				item.localSyncFolder,
				item.databricksConnectJars,
				item.pythonInterpreter,
				item.port,
				item.organizationId,
				item.exportFormats));
		}
		return Promise.resolve(envItems);
	}

	async add(): Promise<void> {
		vscode.window.showErrorMessage("Please use the Settings -> Databricks to configure a single/default enviornment or the JSON editor to add multiple Connections!");
		return;
		let config = ThisExtension.configuration.packageJSON.contributes.configuration[0];
		let requiredSettings = config.required;

		let newEnvConfig: Map<string, any> = new Map<string, any>();

		for (let setting in requiredSettings) {
			let settingName: string = requiredSettings[setting];
			let settingConfig = config.properties[settingName];
			let newValue = await Helper.showInputBox(settingConfig.default, settingConfig.description);

			newEnvConfig.set(settingName.replace('databricks.connection.default.', ''), newValue);
		}

		//let newEnv = DatabricksConnectionTreeItem.fromJson(JSON.stringify(newEnvConfig));
		let newEnv: DatabricksConnection = Helper.mapToObject<DatabricksConnection>(newEnvConfig);

		let currentConnections: DatabricksConnection[] = vscode.workspace.getConfiguration().get('databricks.connections');

		currentConnections.push(newEnv);

		vscode.workspace.getConfiguration().update('databricks.connections', currentConnections, vscode.ConfigurationTarget.Workspace);
	}
}
