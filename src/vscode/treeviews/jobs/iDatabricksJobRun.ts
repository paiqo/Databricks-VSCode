import { JobRunLifeCycleState, JobRunResultState, JobRunType } from "./_types";

export interface iDatabricksJobRun {
	job_id: number;
	run_id: number;
	run_name: string;
	run_type: JobRunType;
	run_page_url: string;
	number_in_job: number;
	state: {
		life_cycle_state: JobRunLifeCycleState,
		state_message: string,
		result_state: JobRunResultState
	};
	task: {
		notebook_task: {
			notebook_path: string,
			revision_timestamp: number,
			base_parameters: object
		},
		spark_jar_task: {
			jar_uri: string,
			main_class_name: string,
			parameters: string[] 
		},
		spark_python_task: {
			python_file: string,
			parameters: string[]
		},
		spark_submit_task: {
		parameters: string[]
		}
	};
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