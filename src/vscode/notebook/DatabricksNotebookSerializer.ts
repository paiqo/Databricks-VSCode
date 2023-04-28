import * as vscode from 'vscode';
import { ThisExtension } from '../../ThisExtension';
import { DatabricksNotebook, DatabricksNotebookCell } from './DatabricksNotebook';
import { DatabricksLanguageMapping } from './_types';

export class DatabricksNotebookSerializer implements vscode.NotebookSerializer {
	public readonly label: string = 'Databricks Notebook Serializer';

	// language-indepenent header
	private readonly HEADER_SUFFIX: string = `Databricks notebook source`;
	private readonly MAGIC_PREFIX: string = `MAGIC`;
	private readonly CELL_SEPARATOR_SUFFIX: string = "COMMAND ----------";

	constructor(context: vscode.ExtensionContext) {
		context.subscriptions.push(
			vscode.workspace.registerNotebookSerializer(
				'databricks-notebook', this, { transientOutputs: true }
			)
		);
	}

	private readonly LANGUAGE_MAPPING: DatabricksLanguageMapping[] = [
		{
			"databricksLanguage": "python",
			"vscodeLanguage": "python",
			"magic": "%python",
			"commentCharacters": "#",
			"fileExtension": ".py"
		},
		{
			"databricksLanguage": "r",
			"vscodeLanguage": "r",
			"magic": "%r",
			"commentCharacters": "#",
			"fileExtension": ".r"
		},
		{
			"databricksLanguage": "scala",
			"vscodeLanguage": "scala",
			"magic": "%scala",
			"commentCharacters": "//",
			"fileExtension": ".scala"
		},
		{
			"databricksLanguage": "sql",
			"vscodeLanguage": "sql",
			"magic": "%sql",
			"commentCharacters": "--",
			"fileExtension": ".sql"
		}
	]
		;

	public async deserializeNotebook(data: Uint8Array, token: vscode.CancellationToken): Promise<DatabricksNotebook> {
		var contents = Buffer.from(data).toString();

		var firstLineWithCode: number = 1;
		const lines: string[] = contents.trimStart().split("\n");
		if (lines.length == 0) {
			ThisExtension.log("Not a Databricks Notebook source file. Creating new Notebook.");
			return { cells: [] };
		}
		if (!lines[0].trimEnd().endsWith(this.HEADER_SUFFIX)) {
			ThisExtension.log("File is not a valid Databricks Notebook source file.");
			//throw new Error("File is not a valid Databricks Notebook source file.");
			firstLineWithCode = 0;
		}

		const commentChars = lines[0].split(" ")[0];

		let notebookLanguage: DatabricksLanguageMapping = this.LANGUAGE_MAPPING.find(x => x.databricksLanguage == "python");
		let cellLanguage: DatabricksLanguageMapping = undefined;
		let languages: DatabricksLanguageMapping[] = this.LANGUAGE_MAPPING.filter(x => x.commentCharacters == commentChars);

		if (languages != undefined && languages.length == 1) {
			notebookLanguage = languages[0];
		}
		else {
			// its Python or R
			const rAssignments = contents.split("<-").length;
			const pythonAssignments = contents.split("=").length;

			if (rAssignments > pythonAssignments) {
				notebookLanguage = this.LANGUAGE_MAPPING.find(x => x.databricksLanguage == "r");
			}
			// else its Python which is the default anyway
		}
		let notebook: DatabricksNotebook = new DatabricksNotebook([]);

		const splitRegex = new RegExp(`\n\n${commentChars} ${this.CELL_SEPARATOR_SUFFIX}\n\n`, "gm");

		let rawCells: string[] = lines.slice(firstLineWithCode).join("\n").split(splitRegex);

		for (const rawCell of rawCells) {
			let cell = new DatabricksNotebookCell(vscode.NotebookCellKind.Code, rawCell, notebookLanguage.vscodeLanguage);
			cell.metadata = { "cellLanguage": notebookLanguage };

			// check for magic
			if (rawCell.startsWith(`${commentChars} ${this.MAGIC_PREFIX}`)) {
				let firstLine = rawCell.split("\n")[0];
				let firstLineValues = firstLine.split(/\s+/gm);
				let magic = firstLineValues[2];

				if (magic == "%md") {
					cell.kind = vscode.NotebookCellKind.Markup;
					cell.value = cell.value.replace(new RegExp(`^${commentChars} ${this.MAGIC_PREFIX} ${magic}\n`, "gm"), "");
				}
				else {
					cellLanguage = this.LANGUAGE_MAPPING.find(x => x.magic == magic);
					if (cellLanguage) {
						cell.metadata = { "cellLanguage": cellLanguage };
					}
				}

				cell.value = cell.value.replace(new RegExp(`^${commentChars} ${this.MAGIC_PREFIX} `, "gm"), "");
			}
			cell.languageId = cell.metadata.cellLanguage.vscodeLanguage;
			notebook.cells.push(cell);
		}


		// set metadata ?
		// notebook.metadata. ...
		notebook.metadata = { "notebookLanguage": notebookLanguage };

		return notebook;
	}

	public async serializeNotebook(data: DatabricksNotebook, token: vscode.CancellationToken): Promise<Uint8Array> {
		// Map the Notebook data into the format we want to save the Notebook data as
		let notebook: DatabricksNotebook = data;

		let notebookLanguage: DatabricksLanguageMapping = notebook.metadata.notebookLanguage;

		for (const cell of notebook.cells as DatabricksNotebookCell[]) {
			if (cell.kind == vscode.NotebookCellKind.Markup) {
				cell.magic = "%md";
				cell.value = `${notebookLanguage.commentCharacters} ${this.MAGIC_PREFIX} ${cell.magic}\n${cell.value}`;
			}

			if (cell.magic) {
				cell.value = cell.value.replace("\n", `\n${notebookLanguage.commentCharacters} ${this.MAGIC_PREFIX} `);
			}
		}

		const headerLine = `${notebookLanguage.commentCharacters} ${this.HEADER_SUFFIX}\n`;
		const codeLines = notebook.cells.flatMap(x => x.value).join(`\n\n${notebookLanguage.commentCharacters} ${this.CELL_SEPARATOR_SUFFIX}\n\n`)


		// Give a string of all the data to save and VS Code will handle the rest
		return await Buffer.from(headerLine + codeLines);
	}
}