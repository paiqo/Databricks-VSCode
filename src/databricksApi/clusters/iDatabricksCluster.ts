import { ClusterState } from './_types';

export interface iDatabricksCluster {
	cluster_id:		string;
	cluster_name:	string;
	state:	ClusterState;
	/*
	num_workers:	bigint;
	autoscale: {
				min_workers:	bigint;
				max_wokrers:	bigint;
				};
	spark_version:	string;
	creator_user_name:	string;
	node_type_id:	string;
	driver_node_type_id:	string;
	autotermination_minutes:	bigint;
	state_message:	string;
	start_time: bigint;
	terminated_time:	bigint;
	last_state_loss_time:	bigint;
	last_activity_time:	bigint;
	cluster_memory_mb:	bigint;
	cluster_cores:	number;
	*/
	/*
	driver:	SparkNode
	executors:	An array of SparkNode
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