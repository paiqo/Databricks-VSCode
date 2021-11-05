export type WorkspaceItemType = 
	"DIRECTORY" 
| 	"NOTEBOOK"
| 	"LIBRARY"
|	"REPO"
|	"FILE";


export type WorkspaceItemExportFormat = 
	"SOURCE" 
| 	"HTML" 
| 	"JUPYTER"
| 	"DBC";


export type WorkspaceItemLanguage = 
	"SCALA" 
| 	"PYTHON" 
| 	"SQL" 
| 	"R" 
| 	undefined;