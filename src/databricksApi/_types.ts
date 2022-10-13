import { iDatabricksWorkspaceItem } from "../vscode/treeviews/workspaces/iDatabricksworkspaceItem";
import { iDatabricksCluster } from "../vscode/treeviews/clusters/iDatabricksCluster";

import { iDatabricksJob } from "../vscode/treeviews/jobs/iDatabricksJob";
import { iDatabricksJobRun } from "../vscode/treeviews/jobs/iDatabricksJobRun";
import { iDatabricksRepo } from "../vscode/treeviews/repos/_types";
import { iDatabricksSecretScope } from "../vscode/treeviews/secrets/iDatabricksSecretScope";
import { iDatabricksSecret } from "../vscode/treeviews/secrets/iDatabricksSecret";
import { iDatabricksRuntimeVersion } from "../vscode/treeviews/clusters/iDatabricksRuntimeVersion";
import { iDatabricksFSItem } from "../vscode/treeviews/dbfs/iDatabricksFSItem";

export type ContextLanguage = 
	"scala" 
| 	"python" 
| 	"sql" 
| 	"r" 
;

export interface iDatabricksApiWorkspaceListResponse {
	objects: iDatabricksWorkspaceItem[];
}

export interface iDatabricksApiWorkspaceExportResponse {
	content: string;
}

export interface iDatabricksApiClustersListResponse {
	clusters: iDatabricksCluster[];
}

export interface iDatabricksApiJobsListResponse {
	jobs: 			iDatabricksJob[];
	has_more:		boolean;
}

export interface iDatabricksApiJobsRunsListResponse {
	runs: 			iDatabricksJobRun[];
	has_more:		boolean;
}


export interface iDatabricksApiContextsCreateResponse {
	id: 			string;
}

export interface iDatabricksApiContextsStatusResponse {
	id: 			string;
	status:			string;
}

export interface iDatabricksApiContextsDestroyResponse {
	id: 			string;
}

export interface iDatabricksApiCommandsExecuteResponse {
	id: 			string;
}

export interface iDatabricksApiCommandsCancelResponse {
	id: 			string;
}

export interface iDatabricksApiCommandsStatusResponse {
	id: 			string;
	status:			string;
	results:		any;
}

export class ExecutionContext {
	context_id: 	string;
	cluster_id: 	string;
	language:		string;
}

export class ExecutionCommand {
	command_id: 	string;
	context_id: 	string;
	cluster_id: 	string;
	language:		string;
}

export interface iDatabricksApiClustersSparkVersionsResponse {
	versions: 			iDatabricksRuntimeVersion[];
}

export interface iDatabricksApiRepoListResponse {
	repos: 				iDatabricksRepo[];
	next_page_token?:	string;
}

export interface iDatabricksApiSecretsScopesListResponse {
	scopes: 			iDatabricksSecretScope[];
}

export interface iDatabricksApiSecretsListResponse {
	secrets: 			iDatabricksSecret[];
}


export interface iDatabricksApiDbfsListResponse {
	files: 			iDatabricksFSItem[];
}

export interface iDatabricksApiDbfsReadResponse {
	bytes_read: 	number;
	data:			string;
}

export interface iDatabricksApiDbfsCreateResponse {
	handle: 		number;
}


