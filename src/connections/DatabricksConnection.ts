import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksConnection } from './iDatabricksConnection';
import { ExportFormatsConfiguration } from '../ThisExtension';
import * as fspath from 'path';

export class DatabricksConnection implements iDatabricksConnection {

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
}