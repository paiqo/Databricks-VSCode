import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';
import { fetch, getProxyAgent, RequestInit, Response } from '@env/fetch';
import { AzureResourceListRepsonse, AzureResource, AzureSubscriptionListRepsonse } from './_types';
import { FSHelper } from '../../../helpers/FSHelper';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';


interface AzureConfig {
	displayName: string;
	resourceId: string;
	localSyncFolder: string;
}
export class DatabricksConnectionManagerAzure extends DatabricksConnectionManager {

	private _managementSession: vscode.AuthenticationSession;
	private _databricksSession: vscode.AuthenticationSession;

	private _tenantId: string;
	private _subscriptionsIds: string[];
	private _workspaces: AzureConfig[];

	private static _azureConnections: iDatabricksConnection[];;

	constructor() {
		super();
	}

	get TenantId(): string {
		return this._tenantId;
	}

	get SubscriptionIDs(): string[] {
		return this._subscriptionsIds;
	}

	set SubscriptionIDs(value: string[]) {
		this._subscriptionsIds = value;
	}

	set Workspaces(value: AzureConfig[]) {
		this._workspaces = value;
	}

	get Workspaces(): AzureConfig[] {
		return this._workspaces;
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager Azure ...");
		this._initialized = false;

		this._tenantId = ThisExtension.getConfigurationSetting("databricks.azure.tenantId").value;
		this._subscriptionsIds = ThisExtension.getConfigurationSetting<string[]>("databricks.azure.subscriptionIds").value;
		this._workspaces = ThisExtension.getConfigurationSetting<AzureConfig[]>("databricks.azure.workspaces").value;

		vscode.authentication.onDidChangeSessions((event) => DatabricksConnectionManagerAzure._onDidChangeSessions(event));

		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No Databricks Workspaces have been found! Please make sure you are connected to the right tenant and have the appropriate permissions!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			await super.manageLastActiveConnection();

			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, true);

			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	private static async _onDidChangeSessions(event: vscode.AuthenticationSessionsChangeEvent)
	{
		vscode.window.showWarningMessage("Session Changed! " + event.provider.id);

		let headers = await ThisExtension.ConnectionManager.getAuthorizationHeaders(ThisExtension.ActiveConnection);
		DatabricksApiService.updateHeaders(headers);
	}

	private async getAADAccessToken(scopes: string[], tenantId?: string): Promise<vscode.AuthenticationSession> {
		//https://www.eliostruyf.com/microsoft-authentication-provider-visual-studio-code/

		if (!scopes.includes("offline_access")) {
			scopes.push("offline_access") // Required for the refresh token.
		}

		if (tenantId) {
			scopes.push("VSCODE_TENANT:" + tenantId);
		}

		let session: vscode.AuthenticationSession = await vscode.authentication.getSession("microsoft", scopes);

		return session;
	}

	async loadConnections(): Promise<void> {
		// to improve switching between Azure Databricks workspaces, we cache the connections once they were loaded
		// to add a newly added Azure Databricks workspace, VSCode needds to be restarted!
		if(DatabricksConnectionManagerAzure._azureConnections && DatabricksConnectionManagerAzure._azureConnections.length > 0)
		{
			this._connections = DatabricksConnectionManagerAzure._azureConnections;
			return;
		}
		// 1. Connect to azure
		// 2. List available workspaces
		// 3. add a new entry for each workspace
		// ignore local sync folder? use global config setting with a root for all workspaces?
		try {
			this._connections = [];

			ThisExtension.setStatusBar("Getting Azure Management Token ...", true);
			this._managementSession = await this.getAADAccessToken(["https://management.core.windows.net//.default", "email"], this.TenantId);
			ThisExtension.setStatusBar("Got Azure Management Token!", true);

			let azureHeaders = {
				"Authorization": 'Bearer ' + this._managementSession.accessToken,
				"Content-Type": 'application/json',
				"Accept": 'application/json'
			}

			const config: RequestInit = {
				method: "GET",
				headers: azureHeaders,
				agent: getProxyAgent()
			};
			let response: Response;

			if (this.Workspaces.length == 0) {
				this.Workspaces = [];
				if (this.SubscriptionIDs.length == 0) {
					ThisExtension.log("Getting list of Azure Subscriptions ...");
					ThisExtension.setStatusBar("Getting Azure Subscriptions ...", true);
					response = await fetch("https://management.azure.com/subscriptions?api-version=2020-01-01", config);

					if (response.ok) {
						let subscriptions: AzureSubscriptionListRepsonse = await response.json() as AzureSubscriptionListRepsonse;
						ThisExtension.setStatusBar("Got " + subscriptions.count.value + " Azure Subscriptions!", false);
						ThisExtension.log("Read " + subscriptions.count.value + " available Azure Subscriptions: " + JSON.stringify(subscriptions));

						this.SubscriptionIDs = subscriptions.value.map((x) => x.subscriptionId);
					}
					else {
						ThisExtension.log("Could not load Azure subscriptions!\n" + await response.text());
						vscode.window.showErrorMessage("Could not load Azure subscriptions!");
					}
				}

				for (let subscriptionID of this.SubscriptionIDs) {
					ThisExtension.log("Checking subscription '" + subscriptionID + "' for Databricks workspaces ...");
					ThisExtension.setStatusBar("Checking Subscription " + subscriptionID + " ...", true);
					response = await fetch(`https://management.azure.com/subscriptions/${subscriptionID}/providers/Microsoft.Databricks/workspaces?api-version=2018-04-01`, config);
					if (response.ok) {
						let azureWorkspaces = await response.json() as AzureResourceListRepsonse
						ThisExtension.setStatusBar("Got " + azureWorkspaces.value.length + " Databricks Workspaces!", false);
						ThisExtension.log("Read " + azureWorkspaces.value.length + " available Databricks Workspaces: " + JSON.stringify(azureWorkspaces));

						for (let workspace of azureWorkspaces.value) {
							let syncFolder: string = undefined;
							if (!ThisExtension.isInBrowser) {
								syncFolder = (await FSHelper.joinPath(FSHelper.getUserDir(), "Databricks-VSCode", workspace.name)).fsPath;
							}
							this.Workspaces.push({
								resourceId: workspace.id,
								displayName: workspace.name,
								localSyncFolder: syncFolder
							})
						}
					}
					else {
						ThisExtension.log("Could not load Databricks Workspaces for subscription '" + subscriptionID + "'!\n" + await response.text());
						vscode.window.showErrorMessage("Could not load Databricks Workspaces from subscription '" + subscriptionID + "'!");
					}
				}
			}

			for (let workspace of this.Workspaces) {
				response = await fetch(`https://management.azure.com/${workspace.resourceId}?api-version=2018-04-01`, config);

				if (response.ok) {
					let azureWorkspace = await response.json() as AzureResource
					ThisExtension.log("Adding Databricks Workspaces: " + JSON.stringify(azureWorkspace));

					let syncFolder: vscode.Uri = undefined;
					if (workspace.localSyncFolder) {
						syncFolder = vscode.Uri.file(workspace.localSyncFolder);
					}
					let newConnection: iDatabricksConnection = {
						_source: "Azure",
						apiRootUrl: vscode.Uri.parse("https://" + azureWorkspace.properties.workspaceUrl),
						displayName: workspace.displayName ?? azureWorkspace.name,
						azureResourceId: azureWorkspace.id,
						localSyncFolder: syncFolder
					};

					if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
						ThisExtension.log("New Connection found: " + newConnection.displayName + " (" + newConnection.azureResourceId + ")");
						this._connections.push(newConnection);
					}
					else {
						ThisExtension.log("Could not load all necessary information from Azure Databricks Workspace '" + newConnection.displayName + "' (" + newConnection.azureResourceId + ")!");
					}
				}
				else {
					ThisExtension.log("Could not load Databricks Workspace '" + workspace.resourceId + "'!\n" + await response.text());
					vscode.window.showErrorMessage("Could not load Databricks Workspace '" + workspace.resourceId + "'!");
				}
			}

			DatabricksConnectionManagerAzure._azureConnections = this._connections;
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void { }

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		let tenantId = ThisExtension.getConfigurationSetting("databricks.azure.tenantId").value;

		ThisExtension.log("Getting Databricks AAD Token ...");
		this._databricksSession = await this.getAADAccessToken(["2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"], tenantId);
		ThisExtension.log("Got Databricks AAD Token!");
		return {
			"X-Databricks-Azure-Workspace-Resource-Id": con.azureResourceId,
			"Authorization": "Bearer " + this._databricksSession.accessToken
		};
	}
}