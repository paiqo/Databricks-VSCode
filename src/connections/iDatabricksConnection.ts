import { CloudProvider } from './_types';
import { ExportFormatsConfiguration } from '../ThisExtension';


export interface iDatabricksConnection {
	displayName: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	apiRootUrl: string;
	localSyncFolder: string;
	exportFormats: ExportFormatsConfiguration;
	useCodeCells: boolean;
}