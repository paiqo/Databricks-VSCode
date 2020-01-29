import * as vscode from 'vscode';
import { DatabricksApiService} from './databricksApi/databricksApiService';
import { DatabricksEnvironmentTreeItem } from './environments/DatabricksEnvironmentTreeItem';
import { iDatabricksEnvironment } from './environments/iDatabricksEnvironment';
import { Helper } from './helpers/Helper';
import { ThisExtension } from './ThisExtension';

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksEnvironmentTreeProvider implements vscode.TreeDataProvider<DatabricksEnvironmentTreeItem> {
	private _activeEnvironment: iDatabricksEnvironment;

	private _onDidChangeTreeData: vscode.EventEmitter<DatabricksEnvironmentTreeItem | undefined> = new vscode.EventEmitter<DatabricksEnvironmentTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<DatabricksEnvironmentTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor() { }

	refresh(): void {
		vscode.window.showInformationMessage(`Refreshing Environments ...`);
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: DatabricksEnvironmentTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DatabricksEnvironmentTreeItem): Thenable<DatabricksEnvironmentTreeItem[]> {	
		const databricksEnvironments = vscode.workspace.getConfiguration().get('databricks.connections');

		// array of file is in result.files
		let items = databricksEnvironments as iDatabricksEnvironment[];
		
		let envItems: DatabricksEnvironmentTreeItem[] = [];
		if(items != undefined)
		{
			items.map(item => envItems.push(new DatabricksEnvironmentTreeItem(
													item.displayName, 
													item.cloudProvider, 
													item.personalAccessToken, 
													item.apiRootUrl, 
													item.localSyncFolder,
													item.databricksConnectJars,
													item.pythonInterpreter,
													item.port,
													item.organizationId)));
		}
		return Promise.resolve(envItems);
	}

	async add(): Promise<void> {
		vscode.window.showErrorMessage("Please use the Settings -> Databricks to configure a single/default enviornment or the JSON editor to add multiple environments!");
		return;
		let config = ThisExtension.configuration.packageJSON.contributes.configuration[0];
		let requiredSettings = config.required;

		let newEnvConfig: Map<string, any> = new Map<string, any>();

		for(let setting in requiredSettings) {
			let settingName: string = requiredSettings[setting];
			let settingConfig = config.properties[settingName];
			let newValue = await Helper.showInputBox(settingConfig.default, settingConfig.description);

			newEnvConfig.set(settingName.replace('databricks.connection.default.', ''), newValue);
		}

		//let newEnv = DatabricksEnvironmentTreeItem.fromJson(JSON.stringify(newEnvConfig));
		let newEnv: iDatabricksEnvironment = Helper.mapToObject<iDatabricksEnvironment>(newEnvConfig);

		let currentConnections: iDatabricksEnvironment[] = vscode.workspace.getConfiguration().get('databricks.connections');

		currentConnections.push(newEnv);

		vscode.workspace.getConfiguration().update('databricks.connections', currentConnections, vscode.ConfigurationTarget.Workspace);
	}
}
