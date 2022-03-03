import { JobRunLifeCycleState, JobRunResultState, JobRunType } from "./_types";

export interface iDatabricksJobRunState {
	life_cycle_state: JobRunLifeCycleState;
	state_message: string;
	result_state: JobRunResultState;
}

export interface iDatabricksJobRunTask {
	run_id: number;
	task_key: string;
	description: string;
	job_cluster_key: string;
	run_page_url: string;
	state: iDatabricksJobRunState;
	depends_on: object[];
	notebook_task: {
		notebook_path: string,
		revision_timestamp: number,
		base_parameters: object
	};
	spark_jar_task: {
		jar_uri: string,
		main_class_name: string,
		parameters: string[]
	};
	spark_python_task: {
		python_file: string,
		parameters: string[]
	};
	spark_submit_task: {
		parameters: string[]
	};
	start_time: number;
	setup_duration: number;
	execution_duration: number;
	cleanup_duration: number;
	end_time: number;
	attempt_number: number;
}

export interface iDatabricksJobRun {
	job_id: number;
	run_id: number;
	run_name: string;
	run_type: JobRunType;
	run_page_url: string;
	number_in_job: number;
	state: iDatabricksJobRunState;
	tasks: iDatabricksJobRunTask[];
	overriding_parameters: object;

	start_time: number;
	setup_duration: number;
	execution_duration: number;
	cleanup_duration: number;
	end_time: number;
	trigger: string;

	creator_user_name: string;
}