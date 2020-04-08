import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksEnvironment } from './iDatabricksEnvironment';
import { ExportFormatsConfiguration } from '../ThisExtension';
import { Helper } from '../helpers/Helper';

export abstract class ActiveDatabricksEnvironment {
	static get displayName(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.displayName');
	}

	static get cloudProvider(): CloudProvider {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.cloudProvider');
	}

	static get apiRootUrl(): string {
		let value: string = vscode.workspace.getConfiguration().get('databricks.connection.default.apiRootUrl');

		if (value.endsWith('/')) {
			vscode.window.showWarningMessage("The setting 'Api Root Url' seems to have a trailing '\' which was automatically removed!");
			return Helper.trimChar(value, '/', false, true);
		}
		return value;
	}

	static get personalAccessToken(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.personalAccessToken');
	}

	static get localSyncFolder(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.localSyncFolder');
	}

	static get databricksConnectJars(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.databricksConnectJars');
	}

	static get pythonInterpreter(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.pythonInterpreter');
	}

	static get port(): number {
		return vscode.workspace.getConfiguration().get<number>('databricks.connection.default.port');
	}

	static get organizationId(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.organizationId');
	}

	static get exportFormatsConfiguration(): ExportFormatsConfiguration {
		return vscode.workspace.getConfiguration().get<ExportFormatsConfiguration>('databricks.connection.default.exportFormats');
	}

	static get allowAllSupportedFileExtensions(): boolean {
		return true;
	}

	static get environment(): iDatabricksEnvironment {
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