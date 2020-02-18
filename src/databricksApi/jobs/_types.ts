export type JobTreeItemType =
	"ROOT"
	| "JOB" 
	| "JOB_RUN" 
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

export interface iDatabricksJob {
	job_id: number;
	settings: {
		name: string;
		new_cluster: object;
		existing_cluster_id: string;
		libraries: object[];
		email_notifications: object;
		timeout_seconds: number;

		max_retries: number;
		min_retry_interval_millis: number;
		retry_on_timeout: boolean;

		schedule: {
			quartz_cron_expression: string,
			timezone_id: string
		},

		max_concurrent_runs: number;

		spark_jar_task: object;
		notebook_task: {
			notebook_path: string,
			base_parameters: object,
			revision_timestamp: number
		},
		spark_python_task: object;
		spark_submit_task: object;
	};
	created_time: number;
}

export interface iDatabricksJobRun {
	job_id: number;
	run_id: number;
	number_in_job: number;
	state: {
		life_cycle_state: JobRunLifeCycleState,
		state_message: string,
		result_state: JobRunResultState
	};
	task: object;
	cluster_spec: object;
	cluster_instance: object;
	overriding_parameters: object;

	start_time: number;
	setup_duration: number;
	execution_duration: number;
	cleanup_duration: number;
	trigger: string;

	creator_user_name: string;
}