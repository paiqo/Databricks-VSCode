import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksEnvironment } from './iDatabricksEnvironment';
import { ExportFormatsConfiguration } from '../ThisExtension';
import { Helper } from '../helpers/Helper';

export class DatabricksEnvironment implements iDatabricksEnvironment {

	private _apiRootUrl: string;

	displayName: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	localSyncFolder: string;
	databricksConnectJars: string;
	pythonInterpreter: string;
	port: number;
	organizationId: string;
	exportFormatsConfiguration: ExportFormatsConfiguration;

	get apiRootUrl(): string {
		let value: string = vscode.workspace.getConfiguration().get('databricks.connection.default.apiRootUrl');

		if (value.endsWith('/')) {
			vscode.window.showWarningMessage("The setting 'Api Root Url' seems to have a trailing '\' which was automatically removed!");
			return Helper.trimChar(value, '/', false, true);
		}
		return value;
	}

	set apiRootUrl(value: string) {
		if (value.endsWith('/')) {
			//vscode.window.showWarningMessage("The setting 'Api Root Url' seems to have a trailing '\' which was automatically removed!");
			this._apiRootUrl = Helper.trimChar(value, '/', false, true);
		}
		else {
			this._apiRootUrl = value;
		}
	}

	get isValid(): boolean {
		if (this.displayName != undefined && this.displayName != "") {
			return true;
		}
		return false;
	}

	get environment(): iDatabricksEnvironment {
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