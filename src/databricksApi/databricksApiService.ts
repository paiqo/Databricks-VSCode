import * as vscode from 'vscode';

import { ThisExtension } from '../ThisExtension';
import { Helper } from '../helpers/Helper';
import { FSHelper } from '../helpers/FSHelper';
import { fetch, getProxyAgent, RequestInit, Response } from '@env/fetch';
import { Buffer } from '@env/buffer';

import { iDatabricksWorkspaceItem } from '../vscode/treeviews/workspaces/iDatabricksworkspaceItem';
import { WorkspaceItemExportFormat, WorkspaceItemLanguage } from '../vscode/treeviews/workspaces/_types';
import { iDatabricksRuntimeVersion } from '../vscode/treeviews/clusters/iDatabricksRuntimeVersion';
import { iDatabricksFSItem } from '../vscode/treeviews/dbfs/iDatabricksFSItem';
import { iDatabricksSecretScope } from '../vscode/treeviews/secrets/iDatabricksSecretScope';
import { iDatabricksSecret } from '../vscode/treeviews/secrets/iDatabricksSecret';
import { ContextLanguage, ExecutionCommand, ExecutionContext, iDatabricksApiClustersListResponse, iDatabricksApiClustersSparkVersionsResponse, iDatabricksApiCommandsCancelResponse, iDatabricksApiCommandsExecuteResponse, iDatabricksApiCommandsStatusResponse, iDatabricksApiContextsCreateResponse, iDatabricksApiContextsDestroyResponse, iDatabricksApiDbfsCreateResponse, iDatabricksApiDbfsListResponse, iDatabricksApiDbfsReadResponse, iDatabricksApiJobsListResponse, iDatabricksApiJobsRunsListResponse, iDatabricksApiRepoListResponse, iDatabricksApiSecretsListResponse, iDatabricksApiSecretsScopesListResponse, iDatabricksApiWorkspaceExportResponse, iDatabricksApiWorkspaceListResponse } from './_types';
import { iDatabricksCluster } from '../vscode/treeviews/clusters/iDatabricksCluster';
import { iDatabricksRepo } from '../vscode/treeviews/repos/_types';
import { iDatabricksConnection } from '../vscode/treeviews/connections/iDatabricksConnection';
import { iDatabricksJob } from '../vscode/treeviews/jobs/iDatabricksJob';
import { iDatabricksJobRun } from '../vscode/treeviews/jobs/iDatabricksJobRun';

export abstract class DatabricksApiService {
	private static API_SUB_URL: string = "/api/";
	private static JOB_API_VERSION = "2.1";

	private static _isInitialized: boolean = false;
	private static _connectionTestRunning: boolean = false;
	private static _apiBaseUrl: string;
	private static _headers;

	//#region Initialization
	static async initialize(con: iDatabricksConnection): Promise<boolean> {
		try {
			ThisExtension.log("Initializing Databricks API Service ...");

			this._isInitialized = false;
			let headers = await ThisExtension.ConnectionManager.getAuthorizationHeaders(con);
			this._apiBaseUrl = Helper.trimChar(con.apiRootUrl.with({ path: '', query: '', fragment: '' }).toString(true), '/') + this.API_SUB_URL;

			this.updateHeaders(headers);

			ThisExtension.log(`Testing new Databricks API (${con.apiRootUrl}) settings ...`);
			this._connectionTestRunning = true;
			let workspaceList = await this.testConnection()
			this._connectionTestRunning = false;
			if (workspaceList && workspaceList.length > 0) {
				ThisExtension.log("Databricks API Service initialized!");
				this._isInitialized = true;
			}
			else {
				ThisExtension.log(JSON.stringify(workspaceList));
				vscode.window.showErrorMessage(`Could not initialize Databricks API for URL ${con.apiRootUrl}!`);
				throw new Error(`Invalid Configuration for Databricks REST API: Cannot access '${con.apiRootUrl}' with headers '${JSON.stringify(headers)}'!`);
			}
		} catch (error) {
			this._connectionTestRunning = false;
			ThisExtension.log("ERROR: " + error);
			vscode.window.showErrorMessage(error);
		}

		return this.isInitialized;
	}

	public static get isInitialized(): boolean {
		return DatabricksApiService._isInitialized;
	}

	public static updateHeaders(authorizationHeaders: any): void {
		this._headers = {
			...authorizationHeaders,
			//"Content-Type": 'application/json', // does not work with CORS ! https://developer.mozilla.org/en-US/docs/Glossary/CORS-safelisted_request_header
			"Accept": 'application/json'
		}
	}
	//#endregion

	//#region Helpers
	private static async writeBase64toFile(base64String: string, filePath: vscode.Uri): Promise<void> {
		await FSHelper.ensureFolder(FSHelper.parent(filePath));

		await vscode.workspace.fs.writeFile(filePath, Buffer.from(base64String, 'base64'));
	}

	private static async readBase64FromFile(filePath: vscode.Uri): Promise<string> {
		// read binary data
		var bitmap = await vscode.workspace.fs.readFile(filePath);
		// convert binary data to base64 encoded string
		return Buffer.from(bitmap).toString('base64');
	}

	private static async logResponse(response: any): Promise<void> {
		let jsonResponse = JSON.stringify(response)

		// when developing, we show the full output
		if (ThisExtension.IsDevelopmentMode) {
			ThisExtension.log("Response: " + jsonResponse);
		}
		else {
			ThisExtension.log("Response: " + jsonResponse.substring(0, 200) + " ...");
		}
	}

	private static async handleApiException(error: Error, showErrorMessage: boolean = false, raise: boolean = false): Promise<void> {
		ThisExtension.log("ERROR: " + error.name + " - " + error.message);

		// only print the stack trace when developing
		if (error.stack && ThisExtension.IsDevelopmentMode) {
			ThisExtension.log("ERROR: " + error.stack);
		}

		if (showErrorMessage) {
			vscode.window.showErrorMessage(error.name + " - " + error.message);
		}

		if (raise) {
			throw error;
		}
	}

	private static getFullUrl(endpoint: string, params?: object): string {
		let uri = vscode.Uri.parse(this._apiBaseUrl + endpoint);

		if (params) {
			let urlParams = []
			for (let kvp of Object.entries(params)) {
				urlParams.push(`${kvp[0]}=${kvp[1] as number | string | boolean}`)
			}
			uri = uri.with({ query: urlParams.join('&') })
		}

		return uri.toString(true);
	}

	/*
	General approach for generic functions like get(), post(), ...
	- provide a dynamic return type using <T> - default is any
	- by default, the value returned is response.json() as T
	- the result is logged using this.logResponse
	- if the api call raises an exception, we log the exception and return undefined
	*/
	private static async get<T = any>(endpoint: string, params: object = null, log: boolean = true, returnType: "JSON" | "TEXT" = "JSON"): Promise<T> {
		if (!this._isInitialized && !this._connectionTestRunning) {
			ThisExtension.log("API has not yet been initialized! Please connect first!");
		}
		else {
			if (log) {
				ThisExtension.log("GET " + endpoint + " --> " + JSON.stringify(params));
			}

			try {
				const config: RequestInit = {
					method: "GET",
					headers: this._headers,
					agent: getProxyAgent()
				};
				let response: Response = await fetch(this.getFullUrl(endpoint, params), config);

				if (!response.ok) {
					ThisExtension.log(`GET ${endpoint} failed! ERROR: " (${response.status}) ${response.statusText}`);
					throw new Error(response.statusText);
				}

				let result;
				if (returnType == "JSON") {
					result = await response.json() as T;
				}
				else {
					result = await response.text();
				}

				if (log) {
					await this.logResponse(result);
				}

				return result;
			} catch (error) {
				this.handleApiException(error);

				return undefined;
			}
		}
	}

	private static async post<T = any>(endpoint: string, body: object, bodyType: "JSON" | "TEXT" = "JSON"): Promise<T> {
		ThisExtension.log("POST " + endpoint + " --> " + JSON.stringify(body));

		try {
			const config: RequestInit = {
				method: "POST",
				headers: this._headers,
				body: bodyType == "JSON" ? JSON.stringify(body) : body.toString(),
				agent: getProxyAgent()
			};
			let response: Response = await fetch(this.getFullUrl(endpoint), config);

			if (bodyType == "JSON") {
				let result: T = await response.json() as T;

				await this.logResponse(result);

				return result;
			}
			return await response.text() as any as T;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}

	private static async patch<T = any>(endpoint: string, body: object): Promise<T> {
		ThisExtension.log("PATCH " + endpoint + " --> " + JSON.stringify(body));

		try {
			const config: RequestInit = {
				method: "PATCH",
				headers: this._headers,
				body: JSON.stringify(body),
				agent: getProxyAgent()
			};
			let response: Response = await fetch(this.getFullUrl(endpoint), config);
			let result: T = await response.json() as T;

			await this.logResponse(result);

			return result;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}

	private static async delete<T = any>(endpoint: string, body: object): Promise<T> {
		ThisExtension.log("DELETE " + endpoint + " --> " + JSON.stringify(body));

		try {
			const config: RequestInit = {
				method: "DELETE",
				headers: this._headers,
				body: JSON.stringify(body),
				agent: getProxyAgent()
			};
			let response: Response = await fetch(this.getFullUrl(endpoint), config);
			let result: T = await response.json() as T;

			await this.logResponse(result);

			return result;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}
	//#endregion


	/*
	General approach for specific API calls
	- for APIs that do not return anything or an empty object {}, we return undefined
	- the object we return has to be defined/typed
	- list-APIs return a sorted array or an empty array
	- paginated APIs return all pages
	*/

	static async testConnection(): Promise<string> {
		let endpoint = '2.0/workspace/list';
		let body = { path: "/" };

		let response: string = await this.get<string>(endpoint, body, true, "TEXT");

		return response;
	}
	//#region Workspace API
	static async listWorkspaceItems(path: string): Promise<iDatabricksWorkspaceItem[]> {
		let endpoint = '2.0/workspace/list';
		let body = { path: path };

		let response: iDatabricksApiWorkspaceListResponse = await this.get<iDatabricksApiWorkspaceListResponse>(endpoint, body);

		if (!response) {
			return undefined
		}

		let items: iDatabricksWorkspaceItem[] = response.objects as iDatabricksWorkspaceItem[];

		if (!items) {
			return [];
		}

		Helper.sortArrayByProperty(items, "path");
		return items;
	}

	static async getWorkspaceItem(path: string): Promise<iDatabricksWorkspaceItem> {
		let endpoint = '2.0/workspace/get-status';
		let body = { path: path };

		let response: iDatabricksWorkspaceItem = await this.get<iDatabricksWorkspaceItem>(endpoint, body);

		if (!response) {
			return undefined
		}

		return response;
	}

	static async downloadWorkspaceItem(path: string, format: WorkspaceItemExportFormat = "SOURCE"): Promise<Uint8Array> {
		let endpoint = '2.0/workspace/export';
		let body = {
			path: path,
			format: format
		};

		ThisExtension.log(`Downloading '${path}' ...`);

		let response: iDatabricksApiWorkspaceExportResponse = await this.get<iDatabricksApiWorkspaceExportResponse>(endpoint, body);

		return await Buffer.from(response.content, 'base64') as Uint8Array;
	}

	static async downloadWorkspaceItemToFile(path: string, localPath: vscode.Uri, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		let data = await this.downloadWorkspaceItem(path, format);

		await FSHelper.ensureFolder(FSHelper.parent(localPath));

		await vscode.workspace.fs.writeFile(localPath, data);
	}

	static async uploadWorkspaceItem(content: Uint8Array, path: string, language: WorkspaceItemLanguage, overwrite: boolean = true, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		let endpoint = '2.0/workspace/import';
		let body = {
			content: await Buffer.from(content).toString('base64'),
			path: path,
			language: language,
			overwrite: overwrite,
			format: format
		};

		ThisExtension.log(`Uploading file to '${path}' ...`);

		let response = await this.post(endpoint, body);
	}

	static async uploadWorkspaceItemFromFile(localPath: vscode.Uri, path: string, language: WorkspaceItemLanguage, overwrite: boolean = true, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		// make sure the folder exists
		let pathItems = path.split('/');
		const fileName = pathItems.pop();
		await this.createWorkspaceFolder(pathItems.join("/"))

		let endpoint = '2.0/workspace/import';
		let body = {
			content: await this.readBase64FromFile(localPath),
			path: path,
			language: language,
			overwrite: overwrite,
			format: format
		};

		ThisExtension.log(`Uploading local path '${localPath}' to '${path}' ...`);

		let response = await this.post(endpoint, body);
	}

	static async createWorkspaceFolder(path: string): Promise<void> {
		let endpoint = '2.0/workspace/mkdirs';
		let body = {
			path: path
		};

		let response = await this.post(endpoint, body);
	}

	static async deleteWorkspaceItem(path: string, recursive: boolean = false): Promise<void> {
		let endpoint = '2.0/workspace/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);
	}
	//#endregion

	//#region Workspace File API (files in Repo)
	static async downloadWorkspaceFile(path: string): Promise<Uint8Array> {
		let endpoint = '2.0/workspace-files/import-file/' + Helper.trimChar(path, '/');

		ThisExtension.log(`Downloading '${path}' ...`);

		let response = await this.get(endpoint, {}, false, "TEXT");

		return await Buffer.from(response, 'latin1') as Uint8Array;
	}

	static async uploadWorkspaceFile(path: string, content: Uint8Array): Promise<void> {
		let endpoint = '2.0/workspace-files/import-file/' + Helper.trimChar(path, '/');

		ThisExtension.log(`Uploading '${path}' ...`);

		let body = (await Buffer.from(content).toString('latin1')) as any as object;

		let response = await this.post<string>(endpoint, body, "TEXT");
	}
	//#endregion

	//#region Context and Command APIs (v1.2)
	static async getExecutionContext(cluster_id: string, language: string = "sql"): Promise<ExecutionContext> {
		let endpoint = '1.2/contexts/create';
		let body = { clusterId: cluster_id, language: language };

		let response: iDatabricksApiContextsCreateResponse = await this.post<iDatabricksApiContextsCreateResponse>(endpoint, body);

		let ret = {
			"cluster_id": cluster_id,
			"language": language,
			"context_id": response.id
		};

		return ret;
	}

	static async removeExecutionContext(context: ExecutionContext): Promise<iDatabricksApiContextsDestroyResponse> {
		let endpoint = '1.2/contexts/destroy ';
		let body = { clusterId: context.cluster_id, contextId: context.context_id };

		let response: iDatabricksApiContextsDestroyResponse = await this.post<iDatabricksApiContextsDestroyResponse>(endpoint, body);

		return response;
	}

	static async runCommand(context: ExecutionContext, command: string, language: ContextLanguage = undefined): Promise<ExecutionCommand> {
		let endpoint = '1.2/commands/execute';
		let body = {
			clusterId: context.cluster_id,
			language: language || context.language,
			contextId: context.context_id,
			command: command
		};

		let response: iDatabricksApiCommandsExecuteResponse = await this.post<iDatabricksApiCommandsExecuteResponse>(endpoint, body);

		let ret = {
			"command_id": response.id,
			"cluster_id": context.cluster_id,
			"language": language || context.language,
			"context_id": context.context_id
		};

		return ret;
	}

	static async getCommandStatus(command: ExecutionCommand): Promise<iDatabricksApiCommandsStatusResponse> {
		let endpoint = '1.2/commands/status';
		let body = {
			clusterId: command.cluster_id,
			contextId: command.context_id,
			commandId: command.command_id
		};

		let response: iDatabricksApiCommandsStatusResponse = await this.get<iDatabricksApiCommandsStatusResponse>(endpoint, body);

		return response;
	}

	static async getCommandResult(command: ExecutionCommand, awaitCompletion: boolean = true): Promise<iDatabricksApiCommandsStatusResponse> {
		let apiResults: iDatabricksApiCommandsStatusResponse = null;
		await Helper.wait(300); // the first time we only wait 300ms to get the status, because the command might be finished already
		do {
			if (apiResults != null) { await Helper.wait(1000); }

			apiResults = await this.getCommandStatus(command);
		} while (awaitCompletion && !["Finished", "Cancelled", "Error"].includes(apiResults.status));

		return apiResults;
	}

	static async cancelCommand(command: ExecutionCommand): Promise<ExecutionCommand> {
		let endpoint = '1.2/commands/cancel';
		let body = {
			clusterId: command.cluster_id,
			contextId: command.context_id,
			commandId: command.command_id
		};

		let response: iDatabricksApiCommandsCancelResponse = await this.post<iDatabricksApiCommandsCancelResponse>(endpoint, body);

		let ret = {
			"command_id": response.id,
			"cluster_id": command.cluster_id,
			"language": command.language,
			"context_id": command.context_id
		};

		return ret;
	}
	//#endregion

	//#region Clusters API
	static async listClusters(): Promise<iDatabricksCluster[]> {
		let endpoint = '2.0/clusters/list';

		let response: iDatabricksApiClustersListResponse = await this.get<iDatabricksApiClustersListResponse>(endpoint);

		if (!response) {
			return undefined;
		}

		let items: iDatabricksCluster[] = response.clusters as iDatabricksCluster[];

		if (!items) {
			return [];
		}

		// running clusters are returned first, so we just keep the order from the API
		//Helper.sortArrayByProperty(items, "cluster_name");
		return items;
	}

	static async startCluster(cluster_id: string): Promise<void> {
		let endpoint = '2.0/clusters/start';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);
	}

	static async stopCluster(cluster_id: string): Promise<void> {
		let endpoint = '2.0/clusters/delete';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);
	}

	static async deleteCluster(cluster_id: string): Promise<void> {
		let endpoint = '2.0/clusters/permanent-delete';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);
	}

	static async pinCluster(cluster_id: string): Promise<void> {
		let endpoint = '2.0/clusters/pin';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);
	}

	static async unpinCluster(cluster_id: string): Promise<void> {
		let endpoint = '2.0/clusters/unpin';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);
	}

	static async listRuntimeVersions(path: string): Promise<iDatabricksRuntimeVersion[]> {
		let endpoint = '2.0/clusters/spark-versions';

		let response: iDatabricksApiClustersSparkVersionsResponse = await this.get<iDatabricksApiClustersSparkVersionsResponse>(endpoint);

		if (!response) {
			return undefined
		}

		let items: iDatabricksRuntimeVersion[] = response.versions as iDatabricksRuntimeVersion[];

		if (!items) {
			return [];
		}

		Helper.sortArrayByProperty(items, "name");
		return items;
	}
	//#endregion

	//#region Jobs API (v2.0)
	static async listJobs(limit: number = 20, offset: number = 0, expandTask: boolean = true): Promise<iDatabricksJob[]> {
		let endpoint = this.JOB_API_VERSION + '/jobs/list';
		let body = {
			limit: limit,
			offset: offset,
			expand_tasks: expandTask
		};

		let response: iDatabricksApiJobsListResponse;

		let jobs: iDatabricksJob[] = [];
		do {

			response = await this.get<iDatabricksApiJobsListResponse>(endpoint, body);

			if (!response) {
				break;
			}

			let items: iDatabricksJob[] = response.jobs as iDatabricksJob[];

			if (!items) {
				return [];
			}

			jobs = jobs.concat(items);

			if (response.has_more) {
				ThisExtension.log("Getting next page of Jobs ...")
				body.offset = body.offset + limit;
			}
		} while (response.has_more)

		return jobs;
	}

	static async listJobRuns(
		job_id: number = null,
		active_only: boolean = false,
		completed_only: boolean = false,
		limit: number = 25,
		expandTasks: boolean = true
	): Promise<iDatabricksJobRun[]> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/list';
		const max_runs_per_call: number = 25;
		let body = {
			job_id: job_id,
			active_only: active_only,
			completed_only: completed_only,
			offset: 0,
			limit: limit > max_runs_per_call ? max_runs_per_call : limit,
			expand_tasks: expandTasks
		};

		let response: iDatabricksApiJobsRunsListResponse;

		let jobRuns: iDatabricksJobRun[] = [];
		do {
			response = await this.get<iDatabricksApiJobsRunsListResponse>(endpoint, body);

			if (!response) {
				break;
			}

			let items: iDatabricksJobRun[] = response.runs as iDatabricksJobRun[];

			if (!items) {
				return [];
			}

			jobRuns = jobRuns.concat(items);

			if (response.has_more) {
				ThisExtension.log("Getting next page of JobRuns ...")
				body.offset = body.offset + max_runs_per_call;
			}
		} while (response.has_more && jobRuns.length <= limit)

		return jobRuns;
	}

	static async runJob(job_id: number): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/run-now';
		let body = {
			job_id: job_id
		};

		let response = await this.post(endpoint, body);
	}

	static async cancelJobRun(run_id: number): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/cancel';
		let body = {
			run_id: run_id
		};

		let response = await this.post(endpoint, body);
	}

	static async exportJobRunToFile(run_id: number, localUri: vscode.Uri): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/export';
		let body = {
			run_id: run_id
		};

		let response = await this.get(endpoint, body);

		let result = await response.json() as any;

		this.writeBase64toFile(result.content, localUri);
	}
	//#endregion

	//#region DBFS API (v2.0)
	static async listDBFSItems(path: string): Promise<iDatabricksFSItem[]> {
		let endpoint = '2.0/dbfs/list';
		let body = { path: path };

		let response: iDatabricksApiDbfsListResponse = await this.get<iDatabricksApiDbfsListResponse>(endpoint, body);

		if (!response) {
			return undefined;
		}

		let items: iDatabricksFSItem[] = response.files as iDatabricksFSItem[];

		if (!items) {
			return [];
		}

		Helper.sortArrayByProperty(items, "path");
		return items;
	}

	static async getDBFSItem(path: string): Promise<iDatabricksFSItem> {
		let endpoint = '2.0/dbfs/get-status';
		let body = { path: path };

		let response: iDatabricksFSItem = await this.get<iDatabricksFSItem>(endpoint, body);

		if (!response) {
			return undefined;
		}

		return response;
	}


	static async readDBFSFileContent(path: string, offset: number, length: number): Promise<iDatabricksApiDbfsReadResponse> {
		let endpoint = '2.0/dbfs/read';
		let body = {
			path: path,
			offset: offset,
			length: length
		};

		// we do not want to log every single file content!
		let response: iDatabricksApiDbfsReadResponse = await this.get<iDatabricksApiDbfsReadResponse>(endpoint, body, false);
		//this.logResponse(response);

		return response;
	}

	static async createDBFSFolder(path: string): Promise<void> {
		let endpoint = '2.0/dbfs/mkdirs';
		let body = {
			path: path
		};

		let response = await this.post(endpoint, body);
	}

	static async deleteDBFSItem(path: string, recursive: boolean): Promise<void> {
		let endpoint = '2.0/dbfs/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);
	}

	static async moveDBFSItem(pathSource: string, pathDestination: string): Promise<void> {
		let endpoint = '2.0/dbfs/move';
		let body = {
			source_path: pathSource,
			destination_path: pathDestination
		};

		let response = await this.post(endpoint, body);
	}

	static async createDBFSFile(path: string, overwrite: boolean): Promise<number> {
		let endpoint = '2.0/dbfs/create';
		let body = {
			path: path,
			overwrite: overwrite
		};

		let response: iDatabricksApiDbfsCreateResponse = await this.post<iDatabricksApiDbfsCreateResponse>(endpoint, body);

		return response.handle;
	}

	static async appendDBFSFileContent(handle: number, base64Content: string): Promise<void> {
		let endpoint = '2.0/dbfs/add-block';
		let body = {
			data: base64Content,
			handle: handle
		};

		let response = await this.post(endpoint, body);
	}

	static async closeDBFSFile(handle: number): Promise<void> {
		let endpoint = '2.0/dbfs/close';
		let body = {
			handle: handle
		};

		let response = await this.post(endpoint, body);
	}

	static async deleteDBFSitem(path: string, recursive: boolean = false): Promise<void> {
		let endpoint = '2.0/dbfs/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);
	}

	static async uploadDBFSFile(localPath: vscode.Uri, dbfsPath: string, overwrite: boolean, batchSize: number = 1048000): Promise<void> {
		let handle = await this.createDBFSFile(dbfsPath, overwrite);

		let content: Uint8Array = await vscode.workspace.fs.readFile(localPath);

		let totalSize = content.length;
		let offset = 0;
		do {
			if (offset + batchSize > totalSize) {
				batchSize = totalSize - offset;
			}

			await this.appendDBFSFileContent(handle, Buffer.from(content.slice(offset, offset + batchSize)).toString('base64'));
			offset = offset + batchSize;
		} while (offset < totalSize);

		await this.closeDBFSFile(handle);
	}

	static async downloadDBFSFile(dbfsPath: string, localPath: vscode.Uri, overwrite: boolean, batchSize: number = 512000): Promise<void> {

		let dbfsItem: iDatabricksFSItem = await this.getDBFSItem(dbfsPath);

		if (dbfsItem.is_dir) {
			throw "The specified path is a directory and not a file!";
		}

		if (FSHelper.pathExists(localPath) && !overwrite) {
			ThisExtension.log("Local path exists and Overwrite is not used!");
			return;
		}

		let totalSize = dbfsItem.file_size;
		let offset = 0;
		let dbfsContent: iDatabricksApiDbfsReadResponse;

		let contentBytesBatch: Uint8Array = new Uint8Array(batchSize);
		let contentBytes: Uint8Array = new Uint8Array(totalSize);

		if (totalSize > 0) // we may also download empty files where the code would not work otherwise
		{
			do {
				if (offset + batchSize > totalSize) {
					batchSize = totalSize - offset;
				}

				dbfsContent = await this.readDBFSFileContent(dbfsPath, offset, batchSize);
				contentBytesBatch = Buffer.from(dbfsContent.data, 'base64');

				// add the batch to the corresponding offset of the final buffer
				contentBytes.set(contentBytesBatch, offset);

				offset = offset + batchSize;
			} while (offset < totalSize);
		}

		await vscode.workspace.fs.writeFile(localPath, contentBytes);
	}
	//#endregion

	//#region Secrets API (v2.0)
	static async listSecretScopes(): Promise<iDatabricksSecretScope[]> {
		let endpoint = '2.0/secrets/scopes/list';

		let response: iDatabricksApiSecretsScopesListResponse = await this.get<iDatabricksApiSecretsScopesListResponse>(endpoint);

		if (!response) {
			return undefined;
		}

		let items = response.scopes as iDatabricksSecretScope[];

		if (!items) {
			return [];
		}

		Helper.sortArrayByProperty(items, "name");
		return items;
	}

	static async createSecretScopes(scope: string, initial_manage_principal: string = "users"): Promise<void> {
		let endpoint = '2.0/secrets/scopes/create';
		let body = {
			scope: scope,
			initial_manage_principal: initial_manage_principal
		};

		let response = await this.post(endpoint, body);
	}

	static async deleteSecretScope(scope: string): Promise<void> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/scopes/delete';
		let body = {
			scope: scope
		};

		let response = await this.post(endpoint, body);
	}

	static async listSecrets(scope: string): Promise<iDatabricksSecret[]> {
		let endpoint = '2.0/secrets/list';
		let body = { scope: scope };

		let response: iDatabricksApiSecretsListResponse = await this.get<iDatabricksApiSecretsListResponse>(endpoint, body);

		if (!response) {
			return undefined;
		}

		let items: iDatabricksSecret[] = response.secrets as iDatabricksSecret[];

		if (!items) {
			return [];
		}

		Helper.sortArrayByProperty(items, "key");
		return items;
	}

	static async setSecret(scope: string, secret: string, value: string): Promise<void> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/put';
		let body = {
			scope: scope,
			key: secret,
			string_value: value
		};

		let response = await this.post(endpoint, body);
	}

	static async deleteSecret(scope: string, secret: string): Promise<void> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/delete';
		let body = {
			scope: scope,
			key: secret
		};

		let response = await this.post(endpoint, body);
	}
	//#endregion

	//#region Repos API (v2.0)
	static async listRepos(path_prefix: string = undefined): Promise<iDatabricksRepo[]> {
		let endpoint = '2.0/repos';

		let body: any = {};
		if (path_prefix != undefined) {
			if (!path_prefix.startsWith("/Repos/")) {
				path_prefix = FSHelper.join("Repos", path_prefix);
			}
			body.path_prefix = path_prefix;
		}

		let response: iDatabricksApiRepoListResponse

		let repos: iDatabricksRepo[] = [];
		do {
			response = await this.get<iDatabricksApiRepoListResponse>(endpoint, body);

			if (!response) {
				break;
			}

			let items: iDatabricksRepo[] = response.repos as iDatabricksRepo[];

			if (!items) {
				return [];
			}

			repos = repos.concat(items);

			if (response.next_page_token) {
				ThisExtension.log("Getting next page of Repos ...")
				body.next_page_token = response.next_page_token
			}
		} while (response.next_page_token)

		Helper.sortArrayByProperty(repos, "path");
		return repos;
	}

	static async updateRepo(repo_id: number, branch: string = undefined, tag: string = undefined): Promise<iDatabricksRepo> {
		let endpoint = `2.0/repos/${repo_id}`;

		let body: any = {};
		if (branch != undefined) {
			body.branch = branch;
		}
		else if (tag != undefined) {
			body.tag = tag;
		}
		else {
			throw Error("Parameter <branch> or <tag> need to be provided when calling updateRep()!");
		}

		let response = await this.patch<iDatabricksRepo>(endpoint, body);

		return response;
	}

	static async deleteRepo(repo_id: number): Promise<void> {
		let endpoint = `2.0/repos/${repo_id}`;

		let body: any = {};

		let response = await this.delete(endpoint, body);
	}
	//#endregion
}
