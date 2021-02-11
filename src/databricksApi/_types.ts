import { iDatabricksJob } from "../vscode/treeviews/jobs/iDatabricksJob";
import { iDatabricksJobRun } from "../vscode/treeviews/jobs/iDatabricksJobRun";

export interface iDatabricksJobResponse {
	jobs: 			iDatabricksJob[];
}

export interface iDatabricksJobRunResponse {
	runs: 			iDatabricksJobRun[];
	has_more:		boolean;
}

