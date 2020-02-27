export type ClusterTreeItemType =
	"ROOT"
	| "CLUSTER" 		// regular Cluster (without a folder)
	| "JOB_CLUSTER_DIR"	// directory for job clusters
	;
	
export type ClusterState = 
	"PENDING" 		// Indicates that a cluster is in the process of being created.
| 	"RUNNING" 		// Indicates that a cluster has been started and is ready for use.
| 	"RESTARTING" 	// Indicates that a cluster is in the process of restarting.
|	"RESIZING" 		// Indicates that a cluster is in the process of adding or removing nodes.
| 	"TERMINATING" 	// Indicates that a cluster is in the process of being destroyed.
| 	"TERMINATED" 	// Indicates that a cluster has been successfully destroyed.
| 	"ERROR" 		// This state is not used anymore. It was used to indicate a cluster that failed to be created. Terminating and Terminated are used instead.
| 	"UNKNOWN" 		// Indicates that a cluster is in an unknown state. A cluster should never be in this state.	
;

export type ClusterSource = 
	"UI"		// Cluster created through the UI.
|	"JOB"		// Cluster created by the Databricks job scheduler.
|	"API"		// Cluster created through an API call.
;