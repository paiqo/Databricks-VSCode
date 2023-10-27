export type UCSystemSchemaState =
	"AVAILABLE" 
|	"ENABLE_INITIALIZED"
|	"ENABLE_COMPLETED" 
|	"DISABLE_INITIALIZED" 
|	"UNAVAILABLE"
	;
	
	export interface iDatabricksUCSystemSchema {
	schema: string;
	state: UCSystemSchemaState;
}
