import * as vscode from 'vscode';

import { Helper } from '../helpers/Helper';
import { FSHelper } from '../helpers/FSHelper';
import { ThisExtension } from '../ThisExtension';

import { iDatabricksWorkspaceItem } from '../vscode/treeviews/workspaces/iDatabricksworkspaceItem';
import { WorkspaceItemExportFormat, WorkspaceItemLanguage } from '../vscode/treeviews/workspaces/_types';
import { iDatabricksRuntimeVersion } from '../vscode/treeviews/clusters/iDatabricksRuntimeVersion';
import { iDatabricksFSItem } from '../vscode/treeviews/dbfs/iDatabricksFSItem';
import { iDatabricksSecretScope } from '../vscode/treeviews/secrets/iDatabricksSecretScope';
import { iDatabricksSecret } from '../vscode/treeviews/secrets/iDatabricksSecret';
import { ContextLanguage, ExecutionCommand, ExecutionContext, iDatabricksJobResponse, iDatabricksJobRunResponse, iDatabricksRepoResponse } from './_types';
import { iDatabricksCluster } from '../vscode/treeviews/clusters/iDatabricksCluster';
import { SecretBackendType } from '../vscode/treeviews/secrets/_types';
import { iDatabricksRepo } from '../vscode/treeviews/repos/_types';
import { AxiosError } from 'axios';
import { iDatabricksConnection } from '../vscode/treeviews/connections/iDatabricksConnection';


import { fetch, getProxyAgent, wrapForForcedInsecureSSL } from '@env/fetch';
import { RequestInit, Response } from '@env/fetch';

export abstract class DatabricksApiService {
	private static API_SUB_URL: string = "/api/";
	private static JOB_API_VERSION = "2.1";
	
	private static _isInitialized: boolean = false;
	private static _connectionTestRunning: boolean = false;
	private static _apiBaseUrl: string;
	private static _headers;

	private static _apiService: any; // to be removed

	//#region Initialization
	static async initialize(con: iDatabricksConnection): Promise<boolean> {
		try {
			ThisExtension.log("Initializing Databricks API Service ...");

			let accessToken = await ThisExtension.ConnectionManager.getAccessToken(con);
			this._apiBaseUrl = Helper.trimChar(con.apiRootUrl.toString(true), '/') + this.API_SUB_URL;
			/*
			const axios = require('axios');
			const httpsAgent = require('https-agent');

			// Set config defaults when creating the instance
			this._apiService = axios.create({
				httpsAgent: new httpsAgent({
					rejectUnauthorized: ThisExtension.rejectUnauthorizedSSL
				}),
				
				proxy: ThisExtension.useProxy
			});
			

			// Alter defaults after instance has been created
			
			this._apiService.defaults.headers.common['Authorization'] = "Bearer " + accessToken;
			this._apiService.defaults.headers.common['Content-Type'] = 'application/json';
			this._apiService.defaults.headers.common['Accept'] = 'application/json';
			*/

			this._headers =  {
					"Authorization" :'Bearer ' + accessToken,
					"Content-Type" : 'application/json',
					"Accept" :'application/json'
			}

			ThisExtension.log(`Testing new Databricks API (${con.apiRootUrl}) settings ...`);
			this._connectionTestRunning = true;
			let workspaceList = await this.listWorkspaceItems("/");
			this._connectionTestRunning = false;
			if (workspaceList.length > 0) {
				ThisExtension.log("Databricks API Service initialized!");
				this._isInitialized = true;
				return true;
			}
			else {
				ThisExtension.log(JSON.stringify(workspaceList));
				throw new Error(`Invalid Configuration for Databricks REST API: Cannot access '${con.apiRootUrl}' with token '${accessToken}'!`);
			}
		} catch (error) {
			this._connectionTestRunning = false;
			ThisExtension.log("ERROR: " + error);
			vscode.window.showErrorMessage(error);
			return false;
		}
	}

	public static get isInitialized(): boolean {
		return DatabricksApiService._isInitialized;
	}
	//#endregion

	//#region Helpers
	private static async writeBase64toFile(base64String: string, filePath: vscode.Uri): Promise<void> {
		FSHelper.ensureFolder(filePath);

		await vscode.workspace.fs.writeFile(filePath, Buffer.from(base64String, 'base64'));
	}

	private static async readBase64FromFile(filePath: vscode.Uri): Promise<string> {
		// read binary data
		var bitmap = await vscode.workspace.fs.readFile(filePath);
		// convert binary data to base64 encoded string
		return Buffer.from(bitmap).toString('base64');
	}

	private static logResponse(response: any): void {
		ThisExtension.log("Response: ");
		ThisExtension.log(JSON.stringify(response.data));
	}

	private static async get(endpoint: string, params: object = null, log: boolean = true): Promise<any> {
		if (!this._isInitialized && !this._connectionTestRunning) {
			ThisExtension.log("API has not yet been initialized! Please connect first!");
		}
		else {
			if(log){
				ThisExtension.log("GET " + endpoint);
				ThisExtension.log("Params:" + JSON.stringify(params));
			}

			let response: any = "Request not yet executed!";
			try {
				const config = {
					method: "GET",
					headers: this._headers
				};
				response = await fetch(this.getFullUrl(endpoint, params), config);
				let json = await response.json();
				let ret = { data: json };
				this.logResponse(ret);

				return ret;
			} catch (error) {
				this.handleApiException(error);

				return undefined;
			}
		}
	}

	private static getFullUrl(endpoint: string, params?: object): string {
		let uri = vscode.Uri.parse(this._apiBaseUrl + endpoint);

		if (params) {
			let urlParams = []
			for (let kvp of Object.entries(params["params"])) {
				urlParams.push(`${kvp[0]}=${kvp[1] as number | string | boolean}`)
			}
			uri = uri.with({ query: urlParams.join('&') })
		}

		return uri.toString(true);
	}

	private static async get_orig(endpoint: string, params: object = null): Promise<any> {
		if (!this._isInitialized && !this._connectionTestRunning) {
			ThisExtension.log("API has not yet been initialized! Please connect first!");
		}
		else {
			ThisExtension.log("GET " + endpoint);
			ThisExtension.log("Params:" + JSON.stringify(params));

			let response: any = "Request not yet executed!";
			try {
				response = await this._apiService.get(endpoint, params);
				this.logResponse(response);
			} catch (error) {
				this.handleApiException(error);

				return undefined;
			}

			return response;
		}
	}

	private static async post(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("POST " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			const config = {
				method: "POST",
				headers: this._headers,
				body: JSON.stringify(body)
			};
			response = await fetch(this.getFullUrl(endpoint), config);
			let json = await response.json();
			let ret = { data: json };
			this.logResponse(ret);

			return ret;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}

	private static async post_orig(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("POST " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			response = await this._apiService.post(endpoint, body);
			this.logResponse(response);
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}

		return response;
	}

	private static async patch_orig(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("PATCH " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			response = await this._apiService.patch(endpoint, body);
			this.logResponse(response);
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}

		return response;
	}

	private static async patch(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("PATCH " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			const config = {
				method: "PATCH",
				headers: this._headers,
				body: JSON.stringify(body)
			};
			response = await fetch(this.getFullUrl(endpoint), config);
			let json = await response.json();
			let ret = { data: json };
			this.logResponse(ret);

			return ret;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}

	private static async delete_orig(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("DELETE " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			response = await this._apiService.delete(endpoint, body);
			this.logResponse(response);
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}

		return response;
	}

	private static async delete(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("DELETE " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			const config = {
				method: "DELETE",
				headers: this._headers,
				body: JSON.stringify(body)
			};
			response = await fetch(this.getFullUrl(endpoint), config);
			let json = await response.json();
			let ret = { data: json };
			this.logResponse(ret);

			return ret;
		} catch (error) {
			this.handleApiException(error);

			return undefined;
		}
	}

	private static async handleApiException(error: Error, showErrorMessage: boolean = false, raise: boolean = false): Promise<void> {
		if (error instanceof AxiosError) {
			let errResponse = error.response;

			let errorMessage = errResponse.data.message;
			if (!errorMessage) {
				errorMessage = errResponse.headers["x-databricks-reason-phrase"];
			}

			ThisExtension.log("ERROR: " + error.message);
			ThisExtension.log("ERROR: " + errorMessage);
			ThisExtension.log("ERROR: " + JSON.stringify(errResponse.data));

			if (showErrorMessage) {
				vscode.window.showErrorMessage(errorMessage);
			}
		}
		else {
			ThisExtension.log("ERROR: " + error.name);
			ThisExtension.log("ERROR: " + error.message);
			if (error.stack) {
				ThisExtension.log("ERROR: " + error.stack);
			}
		}

		if (raise) {
			throw error;
		}
	}
	//#endregion

	//#region Context and Command APIs (v1.2)
	static async getExecutionContext(cluster_id: string, language: string = "sql"): Promise<ExecutionContext> {
		let endpoint = '1.2/contexts/create';
		let body = { clusterId: cluster_id, language: language };

		let response = await this.post(endpoint, body);

		let ret = {
			"cluster_id": cluster_id,
			"language": language,
			"context_id": response.data.id
		};

		return ret;
	}

	static async runCommand(context: ExecutionContext, command: string, language: ContextLanguage = undefined): Promise<ExecutionCommand> {
		let endpoint = '1.2/commands/execute';
		let body = {
			clusterId: context.cluster_id,
			language: language || context.language,
			contextId: context.context_id,
			command: command
		};

		let response = await this.post(endpoint, body);

		let ret = {
			"command_id": response.data.id,
			"cluster_id": context.cluster_id,
			"language": language || context.language,
			"context_id": context.context_id
		};

		return ret;
	}

	static async getCommandStatus(command: ExecutionCommand) {
		let endpoint = '1.2/commands/status';
		let body = {
			clusterId: command.cluster_id,
			contextId: command.context_id,
			commandId: command.command_id
		};

		let response = await this.get(endpoint, { params: body });

		return response;
	}

	static async getCommandResult(command: ExecutionCommand, awaitCompletion: boolean = true, rawOutput: boolean = false) {
		let apiResults = null;
		do {
			if (apiResults != null) { await Helper.wait(1000); }

			apiResults = await this.getCommandStatus(command);
		} while (awaitCompletion && !["Finished", "Cancelled", "Error"].includes(apiResults.data.status));

		if (apiResults.data.status == "Finished") {
			if (rawOutput) {
				return apiResults.data;
			}
			if (apiResults.data.results.resultType == "table") {
				let data = [];
				let schema = apiResults.data.results.schema;

				for (let row of apiResults.data.results.data) {
					let newRow = {};

					for (let i = 0; i < schema.length; i++) {
						newRow[schema[i].name] = row[i];
					}

					data.push(newRow);
				}

				return data;
			}
			else if (apiResults.data.results.resultType == "text") {
				return apiResults.results.data;
			}
			else if (apiResults.data.results.resultType == "error") {
				ThisExtension.log(apiResults);
			}
		}
		else if (apiResults.data.status == "Error") {
			ThisExtension.log(apiResults);
		}
		return apiResults;
	}

	static async cancelCommand(command: ExecutionCommand): Promise<ExecutionCommand> {
		let endpoint = '1.2/commands/cancel';
		let body = {
			clusterId: command.cluster_id,
			contextId: command.context_id,
			commandId: command.command_id
		};

		let response = await this.post(endpoint, body);

		let ret = {
			"command_id": response.data.id,
			"cluster_id": command.cluster_id,
			"language": command.language,
			"context_id": command.context_id
		};

		return ret;
	}

	static async removeExecutionContext(context: ExecutionContext): Promise<void> {
		let endpoint = '1.2/contexts/destroy ';
		let body = { clusterId: context.cluster_id, contextId: context.context_id };

		let response = await this.post(endpoint, body);

		return response.data.id;
	}

	//#endregion

	//#region Workspace API
	static async listWorkspaceItems(path: string): Promise<iDatabricksWorkspaceItem[]> {
		let endpoint = '2.0/workspace/list';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		let result = response.data;
		let items = result.objects as iDatabricksWorkspaceItem[];

		if (items == undefined) {
			return [];
		}
		Helper.sortArrayByProperty(items, "path");
		return items;
	}

	static async getWorkspaceItem(path: string): Promise<iDatabricksWorkspaceItem> {
		let endpoint = '2.0/workspace/get-status';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		if (!response) {
			return undefined;
		}
		let result = response.data;

		return result;
	}

	static async downloadWorkspaceItem(path: string, format: WorkspaceItemExportFormat = "SOURCE"): Promise<Uint8Array> {
		let endpoint = '2.0/workspace/export';
		let body = {
			path: path,
			format: format
		};

		ThisExtension.log(`Downloading '${path}' ...`);

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		return await Buffer.from(result.content, 'base64') as Uint8Array;
	}

	static async downloadWorkspaceItemToFile(path: string, localPath: vscode.Uri, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		let endpoint = '2.0/workspace/export';
		let body = {
			path: path,
			format: format
		};

		ThisExtension.log(`Downloading '${path}' to local path '${localPath}' ...`);

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		await this.writeBase64toFile(result.content, localPath);
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

		let result = response.data;
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

		let result = response.data;
	}

	static async downloadWorkspaceFile(path: string): Promise<Uint8Array> {
		let endpoint = '2.0/workspace-files/import-file/' + Helper.trimChar(path, '/');

		ThisExtension.log(`Downloading '${path}' ...`);

		let response = await this.get(endpoint);

		let result = response.data;

		return await Buffer.from(result, 'latin1') as Uint8Array;
	}

	static async uploadWorkspaceFile(path: string, content: Uint8Array): Promise<void> {
		let endpoint = '2.0/workspace-files/import-file/' + Helper.trimChar(path, '/');

		ThisExtension.log(`Uploading '${path}' ...`);

		let body = (await Buffer.from(content).toString('latin1')) as any as object;

		let response = await this.post(endpoint, body);

		let result = response.data;
	}


	static async createWorkspaceFolder(path: string): Promise<void> {
		let endpoint = '2.0/workspace/mkdirs';
		let body = {
			path: path
		};

		let response = await this.post(endpoint, body);

		let result = response.data;
	}

	static async deleteWorkspaceItem(path: string, recursive: boolean = false): Promise<void> {
		let endpoint = '2.0/workspace/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);

		let result = response.data;
	}
	//#endregion

	//#region Clusters API
	static async listClusters(): Promise<iDatabricksCluster[]> {
		let endpoint = '2.0/clusters/list';

		let response = await this.get(endpoint);

		let result = response.data;
		let items = result.clusters as iDatabricksCluster[];

		if (items == undefined) {
			return [];
		}

		return items;
	}

	static async startCluster(cluster_id: string): Promise<object> {
		let endpoint = '2.0/clusters/start';
		let body = { cluster_id: cluster_id };

		let response = await this.post(endpoint, body);

		return response;
	}

	static async stopCluster(cluster_id: string): Promise<object> {
		let endpoint = '2.0/clusters/delete';
		let body = { cluster_id: cluster_id };

		let response = this.post(endpoint, body);

		return response;
	}

	static async deleteCluster(cluster_id: string): Promise<object> {
		let endpoint = '2.0/clusters/permanent-delete';
		let body = { cluster_id: cluster_id };

		let response = this.post(endpoint, body);

		return response;
	}

	static async listRuntimeVersions(path: string): Promise<iDatabricksRuntimeVersion[]> {
		let endpoint = '2.0/clusters/spark-versions';

		let response = await this.get(endpoint);

		let result = response.data;

		return result.versions;
	}
	//#endregion

	//#region Jobs API (v2.0)
	static async listJobs(): Promise<iDatabricksJobResponse> {
		let endpoint = this.JOB_API_VERSION + '/jobs/list';
		let body = {
			expand_tasks: true
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data as iDatabricksJobResponse;

		if (result == undefined) {
			return { jobs: [] };
		}

		return result;
	}

	static async listJobRuns(
		job_id: number = null,
		active_only: boolean = false,
		completed_only: boolean = false,
		offset: number = null,
		limit: number = null
	): Promise<iDatabricksJobRunResponse> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/list';
		let body = {
			job_id: job_id,
			active_only: active_only,
			completed_only: completed_only,
			offset: offset,
			limit: limit,
			expand_tasks: true
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data as iDatabricksJobRunResponse;

		if (result == undefined) {
			return { runs: [], has_more: false };
		}

		return result;
	}

	static async runJob(job_id: number): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/run-now';
		let body = {
			job_id: job_id
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async cancelJobRun(run_id: number): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/cancel';
		let body = {
			run_id: run_id
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	// todo change localPath to vscode.Uri
	static async exportJobRun(run_id: number, localPath: string): Promise<void> {
		let endpoint = this.JOB_API_VERSION + '/jobs/runs/export';
		let body = {
			run_id: run_id
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		this.writeBase64toFile(result.content, vscode.Uri.file(localPath));
	}

	//#endregion

	//#region DBFS API (v2.0)
	static async listDBFSItems(path: string): Promise<iDatabricksFSItem[]> {
		let endpoint = '2.0/dbfs/list';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		if (response == undefined) {
			return [];
		}

		let result = response.data.files;

		return result;
	}

	static async getDBFSItem(path: string): Promise<iDatabricksFSItem> {
		let endpoint = '2.0/dbfs/get-status';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		if (!response) {
			return undefined;
		}
		let result = response.data;

		return result;
	}


	static async readDBFSFileContent(path: string, offset: number, length: number): Promise<any> {
		let endpoint = '2.0/dbfs/read';
		let body = {
			path: path,
			offset: offset,
			length: length
		};

		// we do not want to log every single file content!
		let response = await this.get(endpoint, { params: body }, false);
		//this.logResponse(response);

		return response;
	}

	static async createDBFSFolder(path: string): Promise<object> {
		let endpoint = '2.0/dbfs/mkdirs';
		let body = {
			path: path
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async deleteDBFSItem(path: string, recursive: boolean): Promise<object> {
		let endpoint = '2.0/dbfs/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async moveDBFSItem(pathSource: string, pathDestination: string): Promise<object> {
		let endpoint = '2.0/dbfs/move';
		let body = {
			source_path: pathSource,
			destination_path: pathDestination
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async createDBFSFile(path: string, overwrite: boolean): Promise<number> {
		let endpoint = '2.0/dbfs/create';
		let body = {
			path: path,
			overwrite: overwrite
		};

		let response = await this.post(endpoint, body);

		return response.data.handle as number;
	}

	static async appendDBFSFileContent(handle: number, base64Content: string): Promise<object> {
		let endpoint = '2.0/dbfs/add-block';
		let body = {
			data: base64Content,
			handle: handle
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async closeDBFSFile(handle: number): Promise<void> {
		let endpoint = '2.0/dbfs/close';
		let body = {
			handle: handle
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async deleteDBFSitem(path: string, recursive: boolean = false): Promise<void> {
		let endpoint = '2.0/dbfs/delete';
		let body = {
			path: path,
			recursive: recursive
		};

		let response = await this.post(endpoint, body);

		return response;
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

		this.closeDBFSFile(handle);
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
		let dbfsContent: { data: { bytes_read: number, data: string } };

		let contentBytesBatch: Uint8Array = new Uint8Array(batchSize);
		let contentBytes: Uint8Array = new Uint8Array(totalSize);

		if (totalSize > 0) // we may also download empty files where the code would not work otherwise
		{
			do {
				if (offset + batchSize > totalSize) {
					batchSize = totalSize - offset;
				}

				dbfsContent = await this.readDBFSFileContent(dbfsPath, offset, batchSize);
				contentBytesBatch = Buffer.from(dbfsContent.data.data, 'base64');

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

		let response = await this.get(endpoint);

		let result = response.data;
		let items = result.scopes as iDatabricksSecretScope[];

		if (items == undefined) {
			return [];
		}
		Helper.sortArrayByProperty(items, "name");
		return items;
	}

	static async createSecretScopes(scope: string, initial_manage_principal: string = "users"): Promise<object> {
		let endpoint = '2.0/secrets/scopes/create';
		let body = {
			scope: scope,
			initial_manage_principal: initial_manage_principal
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async deleteSecretScope(scope: string): Promise<object> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/scopes/delete';
		let body = {
			scope: scope
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async listSecrets(scope: string, scope_backend_type: SecretBackendType): Promise<iDatabricksSecret[]> {
		let endpoint = '2.0/secrets/list';
		let body = { scope: scope };

		let response = await this.get(endpoint, { params: body });

		let result = response.data;
		let items: iDatabricksSecret[] = result.secrets as iDatabricksSecret[];

		if (items == undefined) {
			return [];
		}
		Helper.sortArrayByProperty(items, "key");
		return items;
	}

	static async setSecret(scope: string, secret: string, value: string): Promise<object> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/put';
		let body = {
			scope: scope,
			key: secret,
			string_value: value
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async deleteSecret(scope: string, secret: string): Promise<object> {
		// currently only sting values are supported!
		let endpoint = '2.0/secrets/delete';
		let body = {
			scope: scope,
			key: secret
		};

		let response = await this.post(endpoint, body);

		return response;
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

		let result: any = undefined;
		let repos: iDatabricksRepo[] = [];
		do {
			let response = await this.get(endpoint, { params: body });

			result = response.data as iDatabricksRepoResponse;

			if (result == undefined) {
				return [];
			}

			repos = repos.concat(result.repos);

			if (result.next_page_token) {
				ThisExtension.log("Getting next page of Repos ...")
				body.next_page_token = result.next_page_token
			}
		} while (result.next_page_token)

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

		let response = await this.patch(endpoint, body);

		return response.data as iDatabricksRepo;
	}

	static async deleteRepo(repo_id: number): Promise<void> {
		let endpoint = `2.0/repos/${repo_id}`;

		let body: any = {};

		let response = await this.delete(endpoint, body);
	}
	//#endregion
}
