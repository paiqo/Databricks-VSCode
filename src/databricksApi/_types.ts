import { iDatabricksJob } from "../vscode/treeviews/jobs/iDatabricksJob";
import { iDatabricksJobRun } from "../vscode/treeviews/jobs/iDatabricksJobRun";

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