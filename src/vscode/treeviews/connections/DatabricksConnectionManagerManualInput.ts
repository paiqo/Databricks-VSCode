import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';

import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';


export class DatabricksConnectionManagerManualInput extends DatabricksConnectionManager {

	constructor() {
		super();
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager ManualInput ...");
		this._initialized = false;
		
		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection manually before proceeding!";
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

	async loadConnections(): Promise<void> {
		try {
			this._connections = [];
			
			let apiRootUrl: string = await Helper.showInputBox("https://adb-123456789012345.99.azuredatabricks.net", "API Root Url", true);
			if (!apiRootUrl) {
				ThisExtension.log("Adding new connection aborted!")
				return;
			}
			let apiUri: vscode.Uri = vscode.Uri.parse(apiRootUrl, true);

			let personalAccessToken: string = await Helper.showInputBox("dapi99887766554433221100987654321098", "Personal Access Token (PAT)", true);
			if (!personalAccessToken) {
				ThisExtension.log("Adding new connection aborted!")
				return;
			}

			let displayName: string = await Helper.showInputBox("", "Display name", true);
			if (!displayName) {
				ThisExtension.log("Adding new connection aborted!")
				return;
			}

			let newConnection: iDatabricksConnection = {
				"apiRootUrl": apiUri,
				"displayName": displayName,
				"personalAccessToken": personalAccessToken,
				"_source": "ManuallyAdded"
			};

			if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
				this._connections.push(newConnection);
			}
			else {
				ThisExtension.log("Connection information not valid - please try again!");
			}
		} catch (e) {
			ThisExtension.log(e);
		}
	}

	updateConnection(updatedCon: iDatabricksConnection): void {	}
}