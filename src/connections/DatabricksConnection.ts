import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksConnection } from './iDatabricksConnection';
import { ExportFormatsConfiguration } from '../ThisExtension';
import { Helper } from '../helpers/Helper';

export class DatabricksConnection implements iDatabricksConnection {

	private _apiRootUrl: string;

	displayName: string;
	apiRootUrl: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	localSyncFolder: string;
	databricksConnectJars: string;
	pythonInterpreter: string;
	port: number;
	organizationId: string;
	exportFormatsConfiguration: ExportFormatsConfiguration;

	get isValid(): boolean {
		if (this.displayName != undefined && this.displayName != "") {
			return true;
		}
		return false;
	}

	get allowAllSupportedFileExtensions(): boolean {
		return true;
	}

	get Connection(): iDatabricksConnection {
		return {
			displayName: this.displayName,
			cloudProvider: this.cloudProvider,
			personalAccessToken: this.personalAccessToken,
			apiRootUrl: this.apiRootUrl,
			localSyncFolder: this.localSyncFolder,
			databricksConnectJars: this.databricksConnectJars,
			pythonInterpreter: this.pythonInterpreter,
			port: this.port,
			organizationId: this.organizationId,
			exportFormatsConfiguration: this.exportFormatsConfiguration
		};
	}
}