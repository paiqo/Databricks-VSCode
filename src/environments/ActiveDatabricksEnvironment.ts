import * as vscode from 'vscode';
import { CloudProvider } from './_types';
import { iDatabricksEnvironment } from './iDatabricksEnvironment';

export abstract class ActiveDatabricksEnvironment {
	static get displayName(): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.displayName');
	}

	static get cloudProvider (): CloudProvider {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.cloudProvider');
	}

	static get apiRootUrl (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.apiRootUrl');
	}

	static get personalAccessToken (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.personalAccessToken');
	}

	static get localSyncFolder (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.localSyncFolder');
	}

	static get databricksConnectJars (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.databricksConnectJars');
	}
	
	static get pythonInterpreter (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.pythonInterpreter');
	}

	static get port (): number {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.port');
	}

	static get organizationId (): string {
		return vscode.workspace.getConfiguration().get('databricks.connection.default.organizationId');
	}

	static get environment (): iDatabricksEnvironment {
		return {
			displayName: 			this.displayName,
			cloudProvider:			this.cloudProvider,
			personalAccessToken:	this.personalAccessToken,
			apiRootUrl: 			this.apiRootUrl,
			localSyncFolder: 		this.localSyncFolder,
			databricksConnectJars: 	this.databricksConnectJars,
			pythonInterpreter: 		this.pythonInterpreter,
			port:					this.port,
			organizationId:			this.organizationId
		};
	}
}