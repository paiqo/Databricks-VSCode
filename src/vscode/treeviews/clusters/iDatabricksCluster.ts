import { ClusterState, ClusterSource } from './_types';

export interface iDatabricksCluster {
	cluster_id:			string;
	cluster_name:		string;
	state:				ClusterState;
	cluster_source: 	ClusterSource;
	
	num_workers?:	number;
	autoscale?: {
				min_workers:	number;
				max_workers:	number;
				};
	spark_version:	string;
	creator_user_name:	string;
	node_type_id:	string;
	driver_node_type_id:	string;
	autotermination_minutes: number;
	state_message:	string;
	start_time: number;
	terminated_time: number;
	last_state_loss_time: number;
	last_activity_time: number;
	cluster_memory_mb: number;
	cluster_cores:	number;
	custom_tags?: {
		ResourceClass?: string
	},
	executors: any[]

	/*
	driver:	SparkNode
	spark_context_id	INT64
	jdbc_port	INT32
	spark_conf	SparkConfPair	
	aws_attributes	AwsAttributes
	node_type_id	STRING
	driver_node_type_id	STRING
	ssh_public_keys	An array of STRING
	custom_tags	An array of ClusterTag
	cluster_log_conf	ClusterLogConf
	init_scripts	An array of InitScriptInfo
	docker_image	DockerImage
	spark_env_vars	SparkEnvPair
	enable_elastic_disk	BOOL
	instance_pool_id	STRING
	cluster_source	AwsAvailability
	default_tags	An array of ClusterTag
	cluster_log_status	LogSyncStatus
	termination_reason	S3StorageInfo
	*/
}