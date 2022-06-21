import { iDatabricksJob } from "../vscode/treeviews/jobs/iDatabricksJob";
import { iDatabricksJobRun } from "../vscode/treeviews/jobs/iDatabricksJobRun";
import { iDatabricksRepo } from "../vscode/treeviews/repos/_types";

export type ContextLanguage = 
	"scala" 
| 	"python" 
| 	"sql" 
| 	"r" 
;

export interface iDatabricksJobResponse {
	jobs: 			iDatabricksJob[];
}

export interface iDatabricksJobRunResponse {
	runs: 			iDatabricksJobRun[];
	has_more:		boolean;
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

export interface iDatabricksRepoResponse {
	repos: 				iDatabricksRepo[];
	next_page_token?:	string;
}