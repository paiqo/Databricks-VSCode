export type JobTreeItemType =
	"ROOT"
	| "JOB" 
	| "JOB_RUN" 
	;

export type JobRunType =
	"JOB_RUN" 			// Normal job run. A run created with Run now.
	| "WORKFLOW_RUN"	// Workflow run. A run created with dbutils.notebook.run.
	| "SUBMIT_RUN" 		// Submit run. A run created with Run now.
	;

export type JobRunLifeCycleState = 
	"PENDING" 			// 	The run has been triggered.If there is not already an active run of the same job, the cluster and execution context are being prepared.If there is already an active run of the same job, the run will immediately transition into a SKIPPED state without preparing any resources.
	| "RUNNING" 		//	The task of this run is being executed.
	| "TERMINATING" 	//	The task of this run has completed, and the cluster and execution context are being cleaned up.
	| "TERMINATED" 		//	The task of this run has completed, and the cluster and execution context have been cleaned up.This state is terminal.
	| "SKIPPED" 		//	This run was aborted because a previous run of the same job was already active.This state is terminal.
	| "INTERNAL_ERROR" 	//	An exceptional state that indicates a failure in the Jobs service, such as network failure over a long period.If a run on a new cluster ends in an INTERNAL_ERROR state, the Jobs service terminates the cluster as soon as possible.This state is terminal.
	;

export type JobRunResultState = 
	"SUCCESS"		//	The task completed successfully.
	| "FAILED"		//	The task completed with an error.
	| "TIMEDOUT"	//	The run was stopped after reaching the timeout.
	| "CANCELED"	//	The run was canceled at user request.
	;

