import * as vscode from 'vscode';
import * as fspath from 'path';
import { ThisExtension, ExportFormatsConfiguration } from '../ThisExtension';
import { CloudProvider } from './_types';
import { iDatabricksConnection } from './iDatabricksConnection';
import { Helper } from '../helpers/Helper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksConnectionTreeItem extends vscode.TreeItem implements iDatabricksConnection {
	_displayName: string;
	_cloudProvider: CloudProvider;
	_personalAccessToken: string;
	_apiRootUrl: string;
	_localSyncFolder: string;
	_isActive: boolean;
	_exportFormats: ExportFormatsConfiguration;
	_useCodeCells: boolean;

	constructor(
		displayName: string,
		cloudProvider: CloudProvider,
		personalAccessToken: string,
		apiRootUrl: string,
		localSyncFolder: string,
		exportFormats: ExportFormatsConfiguration = undefined,
		useCodeCells: boolean = false
	) {
		super(displayName);
		this._displayName = displayName;
		this._cloudProvider = cloudProvider;
		this._personalAccessToken = personalAccessToken;
		this._apiRootUrl = Helper.trimChar(apiRootUrl, '/', false, true);
		//this._localSyncFolder = Helper.trimChar(localSyncFolder, '/');
		this._localSyncFolder = localSyncFolder;
		this._exportFormats = exportFormats;
		this._useCodeCells = useCodeCells;

		this._isActive = this.displayName === ThisExtension.ActiveConnectionName;

		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
		// Connections are never expandable
		super.collapsibleState = undefined;

		this._isActive = false;
	}

	get tooltip(): string {
		return `${this.displayName} (${this.cloudProvider})`;
	}

	// description is show next to the label
	get description(): string {
		return `${this.localSyncFolder}`;
	}

	// used in package.json to filter commands via viewItem == ACTIVE
	get contextValue(): string {
		if (this.displayName == ThisExtension.ActiveConnectionName) {
			return 'ACTIVE';
		}
		return 'INACTIVE';
	}

	private getIconPath(theme: string): string {
		let state = this.isActive ? 'connected' : 'disconnected';
		return fspath.join(ThisExtension.rootPath, 'resources', theme, state + '.png');
	}


	get displayName(): string {
		return this._displayName;
	}

	get cloudProvider(): CloudProvider {
		return this._cloudProvider;
	}

	get apiRootUrl(): string {
		return this._apiRootUrl;
	}

	get personalAccessToken(): string {
		return this._personalAccessToken;
	}

	get localSyncFolder(): string {
		return this._localSyncFolder;
	}

	get exportFormats(): ExportFormatsConfiguration {
		return this._exportFormats;
	}

	get useCodeCells(): boolean {
		return this._useCodeCells;
	}


	get isActive(): boolean {
		return this._isActive;
	}

	static fromJson(jsonString: string): DatabricksConnectionTreeItem {
		let item: iDatabricksConnection = JSON.parse(jsonString);
		return DatabricksConnectionTreeItem.fromConnection(item);
	}

	static fromConnection(Connection: iDatabricksConnection) {
		return new DatabricksConnectionTreeItem(
			Connection.displayName,
			Connection.cloudProvider,
			Connection.personalAccessToken,
			Connection.apiRootUrl,
			Connection.localSyncFolder,
			Connection.exportFormats,
			Connection.useCodeCells);
	}

	activate(): void {
		vscode.window.showInformationMessage(`Activating Databricks Connection '${this.displayName}' ...`);

		ThisExtension.ConnectionManager.activateConnection(this.displayName);

		this._isActive = true;

		//Helper.delay(1000);

		vscode.commands.executeCommand("DatabricksConnections.refresh", false);
		vscode.commands.executeCommand("databricksWorkspace.refresh", false);
		vscode.commands.executeCommand("databricksClusters.refresh", false);
		vscode.commands.executeCommand("databricksJobs.refresh", false);
		vscode.commands.executeCommand("databricksFS.refresh", false);
		vscode.commands.executeCommand("databricksSecrets.refresh", false);
	}
}
