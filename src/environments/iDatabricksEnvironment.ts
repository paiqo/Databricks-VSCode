import { CloudProvider } from './_types';
import { ExportFormatsConfiguration } from '../ThisExtension';


export interface iDatabricksEnvironment {
	displayName: string;
	cloudProvider: CloudProvider;
	personalAccessToken: string;
	apiRootUrl: string;
	localSyncFolder: string;
	databricksConnectJars: string;
	pythonInterpreter: string;
	port: number;
	organizationId: string;
	exportFormatsConfiguration: ExportFormatsConfiguration;
}