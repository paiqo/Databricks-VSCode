import * as vscode from 'vscode';

import { AccessTokenSecure, ConnectionSource } from './_types';
import { ExportFormatsConfiguration, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
export interface iDatabricksConnection {
	displayName: string;
	personalAccessToken?: string;
	personalAccessTokenSecure?: AccessTokenSecure;
	apiRootUrl: vscode.Uri;
	localSyncFolder?: vscode.Uri;
	localSyncSubfolders?: LocalSyncSubfolderConfiguration;
	exportFormats?: ExportFormatsConfiguration;
	useCodeCells?: boolean;

	_source: ConnectionSource;

	azureResourceId?: string;
}