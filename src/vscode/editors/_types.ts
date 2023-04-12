import * as vscode from 'vscode';

export interface DatabricksSendToApiEndpointConfig extends vscode.QuickPickItem { 
	endpoint: string;
	method: "POST" | "PATCH";
	helpLink: vscode.Uri
}

export interface DatabricksSendToApiConfig extends vscode.QuickPickItem { 
	endpoints: DatabricksSendToApiEndpointConfig[];
	refreshCommand: string;
}