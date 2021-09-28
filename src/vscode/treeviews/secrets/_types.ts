export type SecretTreeItemType = 
	"ROOT"
|	"SCOPE" 		// 1st level, groups secrets
| 	"SECRET" 		// single secret
;

export type SecretBackendType = 
	"DATABRICKS" 		// Databricks internal secret store
| 	"AZURE_KEYVAULT" 		// ??
;