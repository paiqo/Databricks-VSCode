import { iDatabricksJob, iDatabricksJobRun } from "./jobs/_types";


export interface iDatabricksJobResponse {
	jobs: 			iDatabricksJob[];
}

export interface iDatabricksJobRunResponse {
	runs: 			iDatabricksJobRun[];
	has_more:		boolean;
}

