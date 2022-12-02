import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';
import { fetch, getProxyAgent, RequestInit, Response } from '@env/fetch';
import { AzureResourceListRepsonse, AzureSubscriptionListRepsonse } from './_types';
import { FSHelper } from '../../../helpers/FSHelper';

export class DatabricksConnectionManagerAzure extends DatabricksConnectionManager {

	private _managementSession: vscode.AuthenticationSession;
	private _databricksSession: vscode.AuthenticationSession;

	constructor() {
		super();
		this._initialized = false;
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager Azure ...");
		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No Databricks Workspaces have been found! Please make sure you are connected to the right tenant and have the appropriate permissions!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			this._lastActiveConnectionName = ThisExtension.getConfigurationSetting("databricks.lastActiveConnection", ThisExtension.SettingScope).value;

			if (!this._lastActiveConnectionName || !this._connections.some((x) => x.displayName == this._lastActiveConnectionName)) {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' is not set - using first available connection instead!");
				this._lastActiveConnectionName = this._connections[0].displayName;
			}
			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, false);

			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}


	private async getAADAccessToken(scopes: string[], tenantId?: string): Promise<vscode.AuthenticationSession> {
		//https://www.eliostruyf.com/microsoft-authentication-provider-visual-studio-code/

		if(!scopes.includes("offline_access")) {
			scopes.push("offline_access") // Required for the refresh token.
		}

		if (tenantId) {
			scopes.push("VSCODE_TENANT:" + tenantId);
		}

		let session: vscode.AuthenticationSession = await vscode.authentication.getSession("microsoft", scopes, { createIfNone: true });

		return session;
	}

	private async getAADAccessToken_OLD(resource: string): Promise<string> {
		// https://github.com/microsoft/vscode-azure-account/blob/main/sample/src/extension.ts

		const { useIdentityPlugin, VisualStudioCodeCredential, DefaultAzureCredential } = require("@azure/identity");

		// The plugin is the package's default export, so you may import and use it
		// as any name you like, and simply pass it to `useIdentityPlugin`.
		const { vsCodePlugin } = require("@azure/identity-vscode");

		useIdentityPlugin(vsCodePlugin);

		//https://learn.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential?view=azure-dotnet
		let credential = new DefaultAzureCredential();

		let accessToken = await credential.getToken(resource);

		return accessToken.token;
	}

	async loadConnections(): Promise<void> {
		// 1. Connect to azure
		// 2. List available workspaces
		// 3. add a new entry for each workspace
		// ignore local sync folder? use global config setting with a root for all workspaces?
		try {
			this._connections = [];

			let tenantId = ThisExtension.getConfigurationSetting("databricks.azure.tenantId").value;

			this._managementSession = await this.getAADAccessToken(["https://management.core.windows.net//.default", "email"], tenantId);

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
			let response: Response = await fetch("https://management.azure.com/subscriptions?api-version=2020-01-01", config);

			let subscriptions: AzureSubscriptionListRepsonse = await response.json() as AzureSubscriptionListRepsonse;

			for (let subscription of subscriptions.value) {
				ThisExtension.log("Checking subscription '" + subscription.subscriptionId + "' for Databricks workspaces ...");
				response = await fetch(`https://management.azure.com/${subscription.id}/providers/Microsoft.Databricks/workspaces?api-version=2018-04-01`, config);

				let workspaces: AzureResourceListRepsonse = await response.json() as AzureResourceListRepsonse;

				for (let workspace of workspaces.value) {
					let newConnection: iDatabricksConnection = {
						_source: "Azure",
						apiRootUrl: vscode.Uri.parse("https://" + workspace.properties.workspaceUrl),
						displayName: workspace.name,
						azureResourceId: workspace.id,
						localSyncFolder: await FSHelper.joinPath(FSHelper.getUserDir(), "Databricks-VSCode", workspace.name)
					};

					if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
						ThisExtension.log("New Connection found: " + newConnection.displayName + " (" + newConnection.azureResourceId + ")");
						this._connections.push(newConnection);
					}
					else {
						ThisExtension.log("Could not load all necessary information from Azure Databricks Workspace '" + newConnection.displayName + "' (" + newConnection.azureResourceId + ")!");
					}
				}
			}
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void { }

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		let tenantId = ThisExtension.getConfigurationSetting("databricks.azure.tenantId").value;

		this._databricksSession = await this.getAADAccessToken(["2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default"], tenantId);
		return {
			"X-Databricks-Azure-Workspace-Resource-Id": con.azureResourceId,
			"Authorization": "Bearer " + this._databricksSession.accessToken
		};
	}
}