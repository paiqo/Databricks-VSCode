import { CloudProvider } from './_types';


export interface iDatabricksEnvironment {
	displayName:			string;
	cloudProvider:			CloudProvider;
	personalAccessToken:	string;
	apiRootUrl: 			string;
	localSyncFolder:		string;
	databricksConnectJars:	string;
	pythonInterpreter:		string;
	port:					number;
	organizationId:			string;
}