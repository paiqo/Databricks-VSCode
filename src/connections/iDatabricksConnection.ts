import { CloudProvider, AccessTokenSecure } from './_types';
import { ExportFormatsConfiguration } from '../ThisExtension';


export interface iDatabricksConnection {
	displayName: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	personalAccessTokenSecure: AccessTokenSecure;
	apiRootUrl: string;
	localSyncFolder: string;
	exportFormats: ExportFormatsConfiguration;
	useCodeCells: boolean;
}