import * as vscode from 'vscode';

import { AccessTokenSecure, ConnectionSource } from './_types';
import { ExportFormatsConfiguration, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
export interface iDatabricksConnection {
	apiRootUrl: vscode.Uri;
	displayName: string;

	// used for authentication
	personalAccessToken?: string;
	personalAccessTokenSecure?: AccessTokenSecure;
	azureResourceId?: string;

	localSyncFolder?: vscode.Uri;
	localSyncSubfolders?: LocalSyncSubfolderConfiguration;
	exportFormats?: ExportFormatsConfiguration;
	useCodeCells?: boolean;

	_source: ConnectionSource;
}