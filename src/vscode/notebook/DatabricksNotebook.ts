import * as vscode from 'vscode';


export const DatabricksNotebookType: string = 'Databricks-notebook';



export class DatabricksNotebook extends vscode.NotebookData {
	// empty for now, might be extended in the future if new features are added

	static getEmptyNotebook(): string {
		return `{
	"cells": [ ],
	"metadata": {
		"application/vnd.databricks.v1+notebook": {
			"dashboards": [],
			"language": "python",
			"notebookMetadata": {
				"pythonIndentUnit": 4
			},
		"notebookName": "EmptyNotebook",
		"widgets": {}
		}
	},
	"nbformat": 4,
	"nbformat_minor": 0
}`
	}
}

export class DatabricksNotebookCell extends vscode.NotebookCellData {

	get magic(): string {
		if (this.value.startsWith("%")) {
			return this.value.split(" ")[0];
		}
	}

	set magic(newMagic: string) {
		if (this.value.startsWith("%")) {
			this.value = this.value.replace(this.magic, newMagic);
		}
		else {
			this.value = newMagic + "\n" + this.value;
		}
	}
}

