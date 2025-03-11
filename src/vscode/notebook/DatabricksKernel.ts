import * as vscode from 'vscode';

import { ThisExtension } from '../../ThisExtension';
import { Helper } from '../../helpers/Helper';
import { FSHelper } from '../../helpers/FSHelper';
import { Buffer } from '@env/buffer';

import { ContextLanguage, ExecutionCommand, ExecutionContext } from '../../databricksApi/_types';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { iDatabricksCluster } from '../treeviews/clusters/iDatabricksCluster';
import { DatabricksWidget } from './Widgets/DatabricksWidget';
import { DatabricksTextWidget } from './Widgets/DatabricksTextWidget';
import { DatabricksSelectorWidget } from './Widgets/DatabricksSelectorWidget';
import { LanguageFileExtensionMapper } from '../treeviews/workspaces/LanguageFileExtensionMapper';
import { DatabricksConnectionManagerDatabricks } from '../treeviews/connections/DatabricksConnectionManagerDatabricks';
import { DatabricksFileDecorationProvider } from '../fileDecoration/DatabricksFileDecorationProvider';

export type NotebookMagic =
	"sql"
	| "python"
	| "scala"
	| "md"
	| "sh"
	| "fs"
	| "pip"
	| "run"
	;

export type KernelType =
	"jupyter-notebook"
	| "databricks-notebook"
	| "interactive"

// https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks
export class DatabricksKernel implements vscode.NotebookController {
	private static baseId: string = 'databricks-notebook-kernel-';
	private static baseLabel: string = 'Databricks ';
	public id: string;
	public label: string;
	readonly notebookType: KernelType;
	readonly description: string = 'Execute code on a remote Databricks cluster';
	readonly supportedLanguages = ["python", "sql", "r", "markdown", "scala"];
	readonly supportsExecutionOrder: boolean = true;

	private _controller: vscode.NotebookController;
	private _executionOrder: number;
	private _language: ContextLanguage;
	private _executionContexts: Map<string, ExecutionContext>;
	private _widgets: Map<string, DatabricksWidget>;
	private _cluster: iDatabricksCluster;

	public static RepoMapping: Map<string, vscode.Uri> = new Map<string, vscode.Uri>();

	constructor(cluster: iDatabricksCluster, notebookType: KernelType, language: ContextLanguage = "python") {
		this.notebookType = notebookType;
		this._cluster = cluster;
		this._language = language;
		this.id = DatabricksKernel.getId(this.KernelID, notebookType);
		this.label = DatabricksKernel.getLabel(cluster.cluster_name);

		this._executionOrder = 0;
		this._executionContexts = new Map<string, ExecutionContext>;
		this._widgets = new Map<string, DatabricksWidget>;

		ThisExtension.log("Creating new " + this.notebookType + " kernel '" + this.id + "'");
		this._controller = vscode.notebooks.createNotebookController(this.id,
			this.notebookType,
			this.label);

		this._controller.supportedLanguages = this.supportedLanguages;
		this._controller.description = "Databricks Cluster " + this.ClusterID;
		this._controller.detail = this.ClusterDetails;
		this._controller.supportsExecutionOrder = this.supportsExecutionOrder;
		this._controller.executeHandler = this.executeHandler.bind(this);
		this._controller.dispose = this.disposeController.bind(this);

		vscode.workspace.onDidOpenNotebookDocument((event) => this._onDidOpenNotebookDocument(event));

		ThisExtension.PushDisposable(this);
	}

	async _onDidOpenNotebookDocument(notebook: vscode.NotebookDocument) {
		// set this controller as recommended Kernel for notebooks opened via dbws:/, wsfs:/ file system or from or local sync folder
		if (notebook.uri.scheme == ThisExtension.WORKSPACE_SCHEME_LEGACY || notebook.uri.scheme == ThisExtension.WORKSPACE_SCHEME || notebook.uri.toString().startsWith(ThisExtension.ActiveConnection.localSyncFolder.toString())) {
			this.Controller.updateNotebookAffinity(notebook, vscode.NotebookControllerAffinity.Preferred);
		}
	}

	createNotebookCellExecution(cell: vscode.NotebookCell): vscode.NotebookCellExecution {
		//throw new Error('Method not implemented.');
		return null;
	}
	interruptHandler?: (notebook: vscode.NotebookDocument) => void | Thenable<void>;
	readonly onDidChangeSelectedNotebooks: vscode.Event<{ readonly notebook: vscode.NotebookDocument; readonly selected: boolean; }>;
	updateNotebookAffinity(notebook: vscode.NotebookDocument, affinity: vscode.NotebookControllerAffinity): void { }

	async executeHandler(cells: vscode.NotebookCell[], notebook: vscode.NotebookDocument, controller: vscode.NotebookController): Promise<void> {
		let execContext: ExecutionContext = this.getNotebookContext(notebook.uri);
		if (!execContext) {
			ThisExtension.setStatusBar("Initializing Kernel ...", true);
			// for databricks-notebook type the language is in the metadata, for jupyter-notebook it defaults to the Kernel default "python"
			execContext = await this.initializeExecutionContext(notebook.metadata?.notebookLanguage?.databricksLanguage);
			this.setNotebookContext(notebook.uri, execContext);
			await this.updateWorkspaceContext(notebook.uri);
			ThisExtension.setStatusBar("Kernel initialized!");
		}
		for (let cell of cells) {
			await this._doExecution(cell, execContext);
			await Helper.wait(10); // Force some delay before executing/queueing the next cell
		}
	}

	// #region Cluster-properties
	static getId(kernelId: string, kernelType: KernelType) {
		return kernelId + "-" + kernelType;
	}

	static getLabel(clusterName: string) {
		return this.baseLabel + clusterName;
	}

	get Controller(): vscode.NotebookController {
		return this._controller;
	}

	get KernelID(): string {
		return this._cluster.kernel_id ?? this._cluster.cluster_id;
	}

	get ClusterID(): string {
		return this._cluster.cluster_id;
	}

	get ClusterDetails(): string {
		let details: string;
		details = "DBR: " + this._cluster.spark_version + ", ";

		details += "Head: " + this._cluster.driver_node_type_id;

		if (this._cluster.num_workers != undefined) {
			if (this._cluster.num_workers > 0) {
				details += " - " + this._cluster.num_workers + " Worker(s): " + this._cluster.node_type_id;
			}
			else {
				details += " (SingleNode)";
			}
		}
		else if (this._cluster.autoscale) {
			details += " - " + this._cluster.executors.length + " (" + this._cluster.autoscale.min_workers + "-" + this._cluster.autoscale.max_workers + ")";
			details += " Worker(s): " + this._cluster.node_type_id;
		}

		return details;
	}

	get Language(): ContextLanguage {
		return this._language;
	}

	private get ClusterRuntime(): { major: number, minor: number } {
		let tokens: string[] = this._cluster.spark_version.split("-")[0].split(".")
		return { major: +tokens[0], minor: +tokens[1] }
	}
	// #endregion

	async disposeController(): Promise<void> {
		for (let context of this._executionContexts.entries()) {
			try {
				ThisExtension.log("Disposing notebook controller - Removing execution context " + context[0] + " ...");
				await DatabricksApiService.removeExecutionContext(context[1]);
			}
			catch (e) { };
		}

		this._executionContexts.clear();
	}

	async dispose(): Promise<void> {
		this.Controller.dispose(); // bound to disposeController() above
	}

	async restart(notebookUri: vscode.Uri = undefined): Promise<void> {
		this._widgets = new Map<string, DatabricksWidget>();
		if (notebookUri == undefined) {
			ThisExtension.log(`Restarting notebook kernel ${this.Controller.id} ...`)
			// we simply remove the current execution context and close it on the Cluster
			// the next execution will then create a new context
			await this.disposeController();
		}
		else {
			ThisExtension.log(`Restarting notebook kernel ${this.Controller.id} for notebook ${notebookUri.toString()} ...`);
			let context: ExecutionContext = this.getNotebookContext(notebookUri);
			await DatabricksApiService.removeExecutionContext(context);
			this._executionContexts.delete(notebookUri.toString());
		}
	}

	async updateWidgets(notebookUri: vscode.Uri = undefined): Promise<void> {
		if (this._widgets && this._widgets.size > 0) {
			let widgetsToUpdate: DatabricksWidget[] = [];
			if (this._widgets.size == 1) {
				widgetsToUpdate = [this._widgets.values().next().value];
			}
			else {
				let options: vscode.QuickPickOptions = { canPickMany: true, ignoreFocusOut: true, placeHolder: "Select widgets to update" };
				widgetsToUpdate = await vscode.window.showQuickPick<DatabricksWidget>([...this._widgets.values()], options) as any as DatabricksWidget[];
			}
			for (let widget of widgetsToUpdate) {
				await widget.promptForInput(this.getNotebookContext(notebookUri), true);
			}
		}
		else {
			vscode.window.showInformationMessage("No widgets found! Please execute the code to create them first!");
		}
	}

	private async initializeExecutionContext(language?: ContextLanguage): Promise<ExecutionContext> {
		return await DatabricksApiService.getExecutionContext(this.ClusterID, language ?? this.Language);
	}

	setNotebookContext(notebookUri: vscode.Uri, context: ExecutionContext): void {
		this._executionContexts.set(notebookUri.toString(), context);
	}

	getNotebookContext(notebookUri: vscode.Uri): ExecutionContext {
		let path = notebookUri.toString();
		if (this._executionContexts.has(path)) {
			return this._executionContexts.get(path);
		}
		return undefined;
	}

	setWidget(name: string, widget: DatabricksWidget): void {
		this._widgets.set(name, widget);
	}
	getWidget(name: string): DatabricksWidget {
		return this._widgets.get(name);
	}

	async updateWorkspaceContext(notebookUri: vscode.Uri): Promise<void> {
		let feature: string = undefined;
		let driverLibraryDirectory: string = undefined; // 
		let driverWorkingDirectory: string = undefined;
		const localSyncFolder = ThisExtension.ActiveConnection.localSyncFolder;

		// if we are working with a notebook from a Databricks folder (works with wsfs:/, dbws:/ and locally synced notebooks)
		if (notebookUri.scheme == ThisExtension.WORKSPACE_SCHEME
			|| notebookUri.scheme == ThisExtension.WORKSPACE_SCHEME_LEGACY
			|| (notebookUri.scheme == "file" && notebookUri.fsPath.startsWith(localSyncFolder.fsPath))) {

			const paths: string[] = notebookUri.path.split(FSHelper.SEPARATOR);
			const sycnPath = await FSHelper.joinPath(localSyncFolder, ThisExtension.ActiveConnection.localSyncSubfolders.Workspace);
			const notebookRelativePath = notebookUri.path.replace(new RegExp(`${sycnPath.path}`, "ig"), "");
			const workspaceRootUri = await vscode.Uri.from({ scheme: "x", authority: "root", path: "/Workspace" });

			if (ThisExtension.ConnectionManagerText == "Databricks Extension") {
				feature = "Databricks Extension Sync";
				const dbConn: DatabricksConnectionManagerDatabricks = ThisExtension.ConnectionManager as DatabricksConnectionManagerDatabricks;

				// this code works for wsfs:/ and also for locally synced notebooks
				driverLibraryDirectory = (await FSHelper.joinPath(workspaceRootUri, dbConn.remoteSyncFolder.path, ...notebookRelativePath.split("/").slice(undefined, -1))).path;
				driverWorkingDirectory = (await FSHelper.joinPath(workspaceRootUri, dbConn.remoteSyncFolder.path)).path;

			}
			else if (paths.includes("Repos")) {
				feature = "FilesInRepo";

				// this code works for wsfs:/ and also for locally synced notebooks
				driverLibraryDirectory = (await FSHelper.joinPath(workspaceRootUri, ...paths.slice(paths.indexOf("Repos"), paths.indexOf("Repos") + 3))).path;
				driverWorkingDirectory = (await FSHelper.joinPath(workspaceRootUri, ...paths.slice(paths.indexOf("Repos"), -1))).path;
			}
			else {
				feature = "FilesInWorkspace";

				// does not work with local files?!
				const relPaths = notebookRelativePath.split("/");
				driverWorkingDirectory = (await FSHelper.joinPath(workspaceRootUri, ...relPaths.slice(undefined, -1))).path;

				const repo = await DatabricksKernel.getRepo(notebookUri);

				if (repo) {
					feature = "RepoInWorkspace";

					driverLibraryDirectory = (await FSHelper.joinPath(workspaceRootUri, repo.path.replace(sycnPath.path, ""))).path;
					//driverLibraryDirectory = (await FSHelper.joinPath(workspaceRootUri, repo.path)).path;
				}
				else {
					// for FilesInWorkspace the libraryDirectory is the same as the workingDirectory
					driverLibraryDirectory = driverWorkingDirectory;
				}
			}
		}
		else {
			ThisExtension.log(`NotebookKernel: Could not identify Notebook location for ${notebookUri} to set up Notebook Driver Context!`);
			ThisExtension.setStatusBar(`No File support!`);
			return;
		}

		ThisExtension.log(`NotebookKernel: Setting up ${feature} support for ${notebookUri}`);
		ThisExtension.setStatusBar(`Initializing ${feature} ...`);

		let context: ExecutionContext = this.getNotebookContext(notebookUri);
		let commandTexts: string[] = ["import os", `os.chdir('${driverWorkingDirectory}')`];

		if (driverLibraryDirectory != undefined) {
			commandTexts.push("import sys");
			commandTexts.push(`sys.path.append('${driverLibraryDirectory}')`);
		}

		let command: ExecutionCommand = await DatabricksApiService.runCommand(context, commandTexts.join("\n"), "python");
		let result = await DatabricksApiService.getCommandResult(command, true);

		if (result.results.resultType == "error") {
			ThisExtension.log(result.results.summary);
			ThisExtension.log(result.results.cause);
			ThisExtension.setStatusBar(`${feature} failed!`);

			vscode.window.showErrorMessage(`Could not setup Notebook Driver Context for '${notebookUri}' on cluster '${this.ClusterID}'\nPlease check logs for details!`);
		}
		else {
			ThisExtension.log(`NotebookKernel: Successfully set up Notebook Driver Context by running the following commands on the driver: \n-> ${commandTexts.join("\n-> ")}`);
			ThisExtension.setStatusBar("Context initialized!");
		}
	}

	async createSqlDfVariable(sqlCommand: string, context: ExecutionContext): Promise<void> {
		// to create the _sqldf variable, we basically just execute the original SQL command again via PySpark
		// which only makes sense if it is a SELECT statement that returns a tabular result
		let sqlCmdClean = sqlCommand.trim().toUpperCase()
		if (!sqlCmdClean.startsWith("SELECT")
			&& !(sqlCmdClean.match(/WITH.*\)\s*SELECT/gms))
			&& !sqlCmdClean.startsWith("SHOW")
			&& !sqlCmdClean.startsWith("DESCRIBE")
		) {
			ThisExtension.log("_sqldf cannot be created for non-SELECT statements!");
			return;
		}
		let languages: Map<ContextLanguage, string> = new Map<ContextLanguage, string>();

		// wrap a sub-select around the original SQL command to make sure we can use it in a FROM clause
		languages.set("python", '_sqldf = spark.sql("""SELECT * FROM (' + sqlCommand + ')""")');
		// currently _sqldf is only supported for PySpark
		//languages.set("scala", 'val _sqldf = spark.sql("' + sqlCommand + '")');
		//languages.set("r", '_sqldf <- sql("' +  sqlCommand + '")');

		for (let language of languages.entries()) {
			ThisExtension.log("_sqldf command for " + language[0] + ": " + language[1]);
			let command = await DatabricksApiService.runCommand(context, language[1], language[0]);
			let result = await DatabricksApiService.getCommandResult(command, true);
		}
	}

	private async parseCommand(cell: vscode.NotebookCell, executionContext: ExecutionContext): Promise<[ContextLanguage, string, NotebookMagic]> {
		let cmd: string = cell.document.getText();
		let magicText: string = undefined;
		let commandText: string = cmd;
		let language: ContextLanguage = executionContext.language as ContextLanguage;
		if (cmd[0] == "%") {
			let lines = cmd.split('\n');
			magicText = lines[0].split(" ")[0].slice(1).trim();
			commandText = lines.slice(1).join('\n');
			if (["python", "sql", "scala", "r", "md"].includes(magicText)) {
				language = magicText as ContextLanguage;
			}
			else {
				// we can run %pip commands "as-is" using the Python language
				language = "python";
				commandText = cmd;
			}
		}

		// we need to convert relative paths to a full path as our Kernel does not have a path itself so relative paths would not work
		commandText = commandText.replace(/dbutils\.notebook\.run\((["'])\./gm, "dbutils.notebook.run($1" + FSHelper.parent(cell.notebook.uri).path);

		commandText = await this.resolveWidgets(commandText, executionContext, language);

		return [language, commandText, magicText as NotebookMagic];
	}

	private async resolveWidgets(commandText: string, context: ExecutionContext, language: ContextLanguage, force: boolean = false): Promise<string> {
		/*
		- get calls to dbutils.widgets.get
		- check if value already exists in _widgets
			- if not, prompt user for value
			- if yes, use existing value
		- replace dbutils.widgets.get with the static value from the widget

		*/
		// shortcut if widgets are not used
		if (!commandText.includes("dbutils.widgets.")
			&& !commandText.includes("CREATE WIDGET")
			&& !commandText.includes("${")
			&& !commandText.includes("getArgument(")) {
			return commandText;
		}

		let widgets: DatabricksWidget[];
		widgets = DatabricksTextWidget.loadFromCommandText(commandText, language);
		widgets = widgets.concat(DatabricksSelectorWidget.loadFromCommandText(commandText, language));

		for (let widget of widgets) {
			if (!this._widgets.has(widget.name) || force) {
				await widget.promptForInput(context);
				this.setWidget(widget.name, widget);
			}
		}

		// for already know widgets, we replace the call to dbutils.widgets.get with the static value
		for (let widget of this._widgets.values()) {
			commandText = await widget.replaceInCommandText(commandText);
		}

		return commandText;
	}

	private async _doExecution(cell: vscode.NotebookCell, executionContext: ExecutionContext): Promise<void> {
		const execution = this.Controller.createNotebookCellExecution(cell);
		execution.executionOrder = ++this._executionOrder;
		execution.start(Date.now());
		execution.clearOutput();

		// wrap a try/catch around the whole execution to make sure we never get stuck
		try {
			let commandText: string = cell.document.getText();
			let language: ContextLanguage = null;
			let magic: NotebookMagic = null;

			[language, commandText, magic] = await this.parseCommand(cell, executionContext);

			ThisExtension.log("Executing " + language + ":\n" + commandText);

			switch (magic) {
				case "md":
					execution.appendOutput(new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text(commandText, 'text/markdown')
					]));

					execution.end(true, Date.now());
					return;
				case "fs":
				case "sh":
					execution.appendOutput(new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text("Magic %" + magic + " is not supported in remote executions!", 'text/plain')
					]));

					execution.end(false, Date.now());
					return;
				case "run":
					let runFile: string = Helper.trimChar(commandText.substring(commandText.indexOf(' ') + 1).trim(), '"');

					let runUri: vscode.Uri;
					if (runFile.startsWith("../")) { // relative path with ..
						runFile = "./" + runFile; // simply prepend ./ and resolve the relative path in the next if()
					}
					if (runFile.startsWith("./")) // relative path provided
					{
						runUri = await FSHelper.joinPath(FSHelper.parent(cell.notebook.uri), runFile);
					}
					else { // absolute path provided
						switch (cell.notebook.uri.scheme) {
							case ThisExtension.WORKSPACE_SCHEME_LEGACY: // legacy
							case ThisExtension.WORKSPACE_SCHEME:
								runUri = vscode.Uri.file(runFile);
								runUri = runUri.with({ scheme: ThisExtension.WORKSPACE_SCHEME })
								break;
							case "file":
								runUri = await FSHelper.joinPath(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ActiveConnection.localSyncSubfolders.Workspace, runFile);
								break;
							default:
								throw new Error("%run is not supported for FileSystem scheme '" + runUri.scheme + "'!");
						}
					}

					ThisExtension.log("Executing %run for '" + runUri + "' ...");
					try {
						switch (runUri.scheme) {
							case ThisExtension.WORKSPACE_SCHEME_LEGACY: // legacy
							case ThisExtension.WORKSPACE_SCHEME:
								// this error is raised if the path is not found or the file is not a notebook
								const notebookNotFoundError = new Error(`Notebook not found: ${runUri.path}. Notebooks can be specified via a relative path (./Notebook or ../folder/Notebook) or via an absolute path (/Abs/Path/to/Notebook). Make sure you are specifying the path correctly.`)
								if (!await FSHelper.pathExists(runUri)) {
									throw notebookNotFoundError;
								}
								// we cannot use vscode.workspace.fs here as we need the SOURCE file and not the ipynb file 
								commandText = Buffer.from(await DatabricksApiService.downloadWorkspaceItem(runUri.path, "SOURCE")).toString();

								// get the language of the executed file
								let wsfsWorkItem = await DatabricksApiService.getWorkspaceItem(runUri.path);
								if (wsfsWorkItem.object_type != "NOTEBOOK") {
									throw notebookNotFoundError;
								}
								language = wsfsWorkItem.language.toLowerCase() as ContextLanguage;

								if (commandText.includes("%run") || commandText.includes("dbutils.notebook.run")) {
									throw new Error("Recursive calls of `%run` or `dbutils.notebook.run()` are not supported! Please refer to https://github.com/paiqo/Databricks-VSCode#notebook-kernel for more information.");
								}

								break;

							case "file":
								// %run is not aware of filetypes/extensions/langauges so we need to check which ones actually exist locally
								let allFiles = await vscode.workspace.fs.readDirectory(FSHelper.parent(runUri));
								let relevantFiles = allFiles.filter(x => x[0].startsWith(FSHelper.basename(runUri)));

								if (relevantFiles.length == 1) {
									runUri = vscode.Uri.joinPath(FSHelper.parent(runUri), relevantFiles[0][0]);
									commandText = Buffer.from(await vscode.workspace.fs.readFile(runUri)).toString();
									language = LanguageFileExtensionMapper.fromUri(runUri).language.toLowerCase() as ContextLanguage;

									// if the local file is an .ipynb, we need to extract the code cells
									if (FSHelper.extension(runUri) == ".ipynb") {
										let notebookJSON = JSON.parse(commandText);
										let cells = notebookJSON["cells"];
										cells = cells.filter(x => x["cell_type"] == "code"); // only take code cells

										let commands: string[] = [];
										for (let cell of cells) {
											commands.push(cell["source"].join("\n"));
										}

										commandText = commands.join("\n");
									}
								}
								else {
									ThisExtension.log("No (or mutiple, non-unique) files found for %run '" + runUri + "'!")
									throw vscode.FileSystemError.FileNotFound(runUri);
								}
								break;
							default:
								throw new Error("%run is not supported for FileSystem scheme '" + runUri.scheme + "'!");
						}
					}
					catch (error) {
						execution.appendOutput(new vscode.NotebookCellOutput([
							vscode.NotebookCellOutputItem.text(error.name + ": " + error.message, 'text/html')
						]));

						execution.appendOutput(new vscode.NotebookCellOutput([
							vscode.NotebookCellOutputItem.error(error),
						]));
						execution.end(false, Date.now());
						return;
					}

					let outputRun: vscode.NotebookCellOutput = new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text(`Code from file '${runUri}':\n ${commandText}`, 'text/plain')
					])

					execution.appendOutput(outputRun);
					ThisExtension.log("Finished getting actual code for %run '" + runUri + "' ...");
					break;
			}

			let command = await DatabricksApiService.runCommand(executionContext, commandText, language);
			execution.token.onCancellationRequested(() => {
				DatabricksApiService.cancelCommand(command);

				execution.appendOutput(new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.text("Execution cancelled!", 'text/plain'),
				]));

				execution.end(false, Date.now());
				return;
			});

			if (command.error) {
				execution.appendOutput(new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.text(command.error, 'text/html')
				]));

				execution.appendOutput(new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.error(new Error(command.error)),
				]));

				execution.end(false, Date.now());
				return;
			}

			let result = await DatabricksApiService.getCommandResult(command, true);

			if (result.results.resultType == "table") {
				let output: vscode.NotebookCellOutput;
				if (result.results.data.length == 0) {
					output = new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text("<Empty result set>", 'text/plain')
					]);
				}
				else {
					let data: Array<any> = [];
					let html: string;

					html = '<div style="height:300px;overflow:auto;resize:both;"><table style="width:100%" class="searchable sortable"><thead><tr>';

					let schema = result.results.schema;

					for (let col of schema) {
						html += '<th>' + col.name + '</th>';
					}

					html += '</tr></thead><tbody>';

					for (let row of result.results.data) {
						let newRow = {};

						html += '<tr>';
						for (let i = 0; i < schema.length; i++) {
							html += '<td>' + row[i] + '</td>';
							newRow[schema[i].name] = row[i];
						}
						html += '</tr>';
						data.push(newRow);
					}

					html += '</tbody></table></div>';

					output = new vscode.NotebookCellOutput([
						vscode.NotebookCellOutputItem.text(html, 'text/html'),
						vscode.NotebookCellOutputItem.json(data, 'text/x-json'), // to be used by proper JSON/table renderers
						vscode.NotebookCellOutputItem.json(data, 'application/json'), // to be used by proper JSON/table renderers
						vscode.NotebookCellOutputItem.json(result.results, 'application/databricks-table') // the original result from databricks including schema and datatypes for more advanced renderers
					])
					output.metadata = { row_count: data.length, truncated: result.results.truncated };
				}
				execution.appendOutput(output);

				if (language == "sql") {
					// we do not await this async function as we do not want to make the execution of this cell unecessarily longer
					this.createSqlDfVariable(commandText, executionContext);
				}
			}
			else if (result.results.resultType == "text") {
				let cellOutput = new vscode.NotebookCellOutput([]);
				let textData: string = result.results.data as string
				if (textData != '') {
					cellOutput.items.push(vscode.NotebookCellOutputItem.text(result.results.data, 'text/plain'));
				}
				// check text output for most common HTML tags/snippets to optionally also render the output as HTML
				if (textData.includes('<!DOCTYPE html>')
					|| textData.includes('</html>')
					|| textData.includes('</div>')
					|| textData.includes('</table>')
				) {
					cellOutput.items.push(vscode.NotebookCellOutputItem.text((result.results.data as string).trim(), 'text/html'));
				}

				execution.appendOutput(cellOutput);
			}
			else if (result.results.resultType == "images") {
				// add support for multiple images, each rendered as individual output
				for (let fileName of result.results.fileNames) {
					// we derive the mimeType from the actual file provided by Databricks and load the actual content from the base64 string
					let mimeType: string = fileName.split(";")[0].split(":")[1];
					let content: string = fileName.split(";", 2)[1];
					execution.appendOutput(new vscode.NotebookCellOutput([
						new vscode.NotebookCellOutputItem(Buffer.from(content.split(",")[1], (content.split(",")[0] as BufferEncoding)), mimeType),
					]))
				}
			}
			else if (result.results.resultType == "error") {
				execution.appendOutput(new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.text(result.results.summary, 'text/html')
				]));

				execution.appendOutput(new vscode.NotebookCellOutput([
					vscode.NotebookCellOutputItem.error(new Error(result.results.cause)),
				]));

				execution.end(false, Date.now());
				return;
			}


			if (["pip"].includes(magic) || commandText.includes("pip install")) {
				await this.updateWorkspaceContext(cell.notebook.uri);
			}

			execution.end(result.status == "Finished", Date.now());

		} catch (error) {
			execution.appendOutput(new vscode.NotebookCellOutput([
				vscode.NotebookCellOutputItem.text(error, 'text/plain')
			]));

			execution.end(false, Date.now());
			return;
		}
	}

	public static addRepo(path: vscode.Uri) {
		if (path) {
			this.RepoMapping.set(path.toString(), path);
			DatabricksFileDecorationProvider.updateFileDecoration([path]);
		}
	}

	public static async getRepo(path: vscode.Uri, strict: boolean = false): Promise<vscode.Uri> {
		if (!path) {
			return undefined;
		}

		if (path.scheme == "file") {
			const localSyncFolder = ThisExtension.ActiveConnection.localSyncFolder;
			const sycnPath = await FSHelper.joinPath(localSyncFolder, ThisExtension.ActiveConnection.localSyncSubfolders.Workspace);

			path = path.with({ path: path.path.replace(new RegExp(`${sycnPath.path}`, "ig"), "") });
		}

		if (!this.RepoMapping || this.RepoMapping.size == 0) {
			let parts = path.path.split(FSHelper.SEPARATOR);

			for (let i = parts.length - 1; i > 0; i--) {
				let probePath = parts.slice(0, i).join(FSHelper.SEPARATOR);

				const item = await DatabricksApiService.getWorkspaceItem(probePath);

				if (item.object_type == "REPO") {
					const repoPath = path.with({ path: probePath });
					this.RepoMapping.set(repoPath.toString(), repoPath);
					break;
				}
			}
		}

		const repo = Helper.find(DatabricksKernel.RepoMapping.values(), (x: vscode.Uri) => {
			if (strict) {
				return path.toString() == x.toString();
			}
			else {
				return path.toString().startsWith(x.toString());
			}
		}
		);

		return repo;
	}

	public static getRepoSync(path: vscode.Uri, strict: boolean = false): vscode.Uri {
		if (!path || !this.RepoMapping || this.RepoMapping.size == 0) {
			return undefined;
		}

		if (path.scheme == "file") {
			const localSyncFolder = ThisExtension.ActiveConnection.localSyncFolder;
			const sycnPath = FSHelper.joinPathSync(localSyncFolder, ThisExtension.ActiveConnection.localSyncSubfolders.Workspace);

			path = path.with({ path: path.path.replace(new RegExp(`${sycnPath.path}`, "ig"), "") });
		}

		const repo = Helper.find(DatabricksKernel.RepoMapping.values(), (x: vscode.Uri) => {
			if (strict) {
				return path.toString() == x.toString();
			}
			else {
				return path.toString().startsWith(x.toString());
			}
		}
		);

		return repo;
	}
}
