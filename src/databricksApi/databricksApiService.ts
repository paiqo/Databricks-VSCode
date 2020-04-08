import * as vscode from 'vscode';
import * as fs from 'fs';
import { iDatabricksWorkspaceItem } from './workspaces/iDatabricksworkspaceItem';
import { WorkspaceItemExportFormat, WorkspaceItemLanguage } from './workspaces/_types';

import { iDatabricksRuntimeVersion } from './clusters/iDatabricksRuntimeVersion';

import { DatabricksFSTreeItem } from './dbfs/DatabricksFSTreeItem';
import { iDatabricksFSItem } from './dbfs/iDatabricksFSItem';

import { DatabricksSecretTreeItem } from './secrets/DatabricksSecretTreeItem';
import { iDatabricksSecretScope } from './secrets/iDatabricksSecretScope';
import { iDatabricksSecret } from './secrets/iDatabricksSecret';

import { Helper } from '../helpers/Helper';
import { iDatabricksJobResponse, iDatabricksJobRunResponse } from './_types';
import { iDatabricksCluster } from './clusters/iDatabricksCluster';
import { ThisExtension } from '../ThisExtension';
import { DatabricksConnection } from '../connections/DatabricksConnection';



export abstract class DatabricksApiService {
	private static API_SUB_URL: string = "/api/";
	private static _apiService: any;

	static initialize(Connection: DatabricksConnection = ThisExtension.ActiveConnection): void {
		ThisExtension.log("Initializing Databricks API Service ...");
		const axios = require('axios');
		// Set config defaults when creating the instance
		this._apiService = axios.create({
			baseURL: Helper.trimChar(Connection.apiRootUrl, '/') + this.API_SUB_URL
		});

		// Alter defaults after instance has been created
		this._apiService.defaults.headers.common['Authorization'] = "Bearer " + Connection.personalAccessToken;
		this._apiService.defaults.headers.common['Content-Type'] = 'application/json';
		this._apiService.defaults.headers.common['Accept'] = 'application/json';

		ThisExtension.log("Databricks API Service initialized!");
	}

	private static writeBase64toFile(base64String: string, filePath: string): void {
		Helper.ensureLocalFolder(filePath, true);
		fs.writeFile(filePath, base64String, { encoding: 'base64' }, function (err) {
			if (err) {
				vscode.window.showErrorMessage(`ERROR writing file: ${err}`);
			}
		});
	}

	private static readBase64FromFile(filePath: string): string {
		// read binary data
		var bitmap = fs.readFileSync(filePath);
		// convert binary data to base64 encoded string
		return Buffer.from(bitmap).toString('base64');
	}

	private static logResponse(response: any): void {
		ThisExtension.log("Response: ");
		ThisExtension.log(JSON.stringify(response.data));
	}

	private static async get(endpoint: string, params: object = null): Promise<any> {
		ThisExtension.log("GET " + endpoint);
		ThisExtension.log("Params:" + JSON.stringify(params));

		let response: any = "Request not yet executed!";
		try {
			response = await this._apiService.get(endpoint, params);
			this.logResponse(response);
		} catch (error) {
			let errResponse = error.response;

			let errorMessage = errResponse.data.message;
			if (!errorMessage) {
				errorMessage = errResponse.headers["x-databricks-reason-phrase"];
			}

			ThisExtension.log("ERROR: " + error.message);
			ThisExtension.log("ERROR: " + errorMessage);
			ThisExtension.log("ERROR: " + JSON.stringify(errResponse.data));

			vscode.window.showErrorMessage(errorMessage);

			return undefined;
		}

		return response;
	}

	private static async post(endpoint: string, body: object): Promise<any> {
		ThisExtension.log("POST " + endpoint);
		ThisExtension.log("Body:" + JSON.stringify(body));

		let response: any = "Request not yet executed!";
		try {
			response = await this._apiService.post(endpoint, body);
			this.logResponse(response);
		} catch (error) {
			let errResponse = error.response;

			let errorMessage = errResponse.data.message;
			if (!errorMessage) {
				errorMessage = errResponse.headers["x-databricks-reason-phrase"];
			}

			ThisExtension.log("ERROR: " + error.message);
			ThisExtension.log("ERROR: " + errorMessage);
			ThisExtension.log("ERROR: " + JSON.stringify(errResponse.data));

			vscode.window.showErrorMessage(errorMessage);

			return undefined;
		}

		return response;
	}

	/*
	----------------------------------------------------------------
	-- W O R K S P A C E   A P I
	----------------------------------------------------------------
	*/
	static async listWorkspaceItems(path: string): Promise<iDatabricksWorkspaceItem[]> {
		let endpoint = '2.0/workspace/list';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		let result = response.data;
		let items = result.objects as iDatabricksWorkspaceItem[];

		Helper.sortArrayByProperty(items, "path");
		return items;
	}

	static async downloadWorkspaceItem(path: string, localPath: string, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		let endpoint = '2.0/workspace/export';
		let body = {
			path: path,
			format: format
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		this.writeBase64toFile(result.content, localPath);
	}

	static async uploadWorkspaceItem(localPath: string, path: string, language: WorkspaceItemLanguage, overwrite: boolean = true, format: WorkspaceItemExportFormat = "SOURCE"): Promise<void> {
		let endpoint = '2.0/workspace/import';
		let body = {
			content: this.readBase64FromFile(localPath),
			path: path,
			language: language,
			overwrite: overwrite,
			format: format
		};

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

	/*
	----------------------------------------------------------------
	-- C L U S T E R S   A P I
	----------------------------------------------------------------
	*/
	static async listClusters(): Promise<iDatabricksCluster[]> {
		let endpoint = '2.0/clusters/list';

		let response = await this.get(endpoint);

		let result = response.data;
		let items = result.clusters as iDatabricksCluster[];

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

	static async listRuntimeVersions(path: string): Promise<iDatabricksRuntimeVersion[]> {
		let endpoint = '2.0/clusters/spark-versions';

		let response = await this.get(endpoint);

		let result = response.data;

		return result.versions;
	}


	/*
	----------------------------------------------------------------
	-- J O B S   A P I
	----------------------------------------------------------------
	*/
	static async listJobs(): Promise<iDatabricksJobResponse> {
		let endpoint = '2.0/jobs/list';

		let response = await this.get(endpoint);

		let result = response.data as iDatabricksJobResponse;

		return result;
	}

	static async listJobRuns(
		job_id: number,
		active_only: boolean = true,
		completed_only: boolean = false,
		offset: number = null,
		limit: number = null
	): Promise<iDatabricksJobRunResponse> {
		let endpoint = '2.0/jobs/runs/list';
		let body = {
			job_id: job_id,
			active_only: active_only,
			completed_only: completed_only,
			offset: offset,
			limit: limit
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data as iDatabricksJobRunResponse;

		return result;
	}

	static async runJob(job_id: number): Promise<void> {
		let endpoint = '2.0/jobs/run-now';
		let body = {
			job_id: job_id
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async cancelJunJob(run_id: number): Promise<void> {
		let endpoint = '2.0/jobs/runs/cancel';
		let body = {
			run_id: run_id
		};

		let response = await this.post(endpoint, body);

		return response;
	}

	static async exportJobRun(run_id: number, localPath: string): Promise<void> {
		let endpoint = '2.0/jobs/runs/export';
		let body = {
			run_id: run_id
		};

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		this.writeBase64toFile(result.content, localPath);
	}

	/*
	----------------------------------------------------------------
	-- D B F S   A P I
	----------------------------------------------------------------
	*/
	static async listDBFSItems(path: string): Promise<DatabricksFSTreeItem[]> {
		let endpoint = '2.0/dbfs/list';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		// array of file is in result.files
		let items = result.files as iDatabricksFSItem[];

		let dbfsItems: DatabricksFSTreeItem[] = [];
		if (items != undefined) {
			items.map(item => dbfsItems.push(new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size)));
			Helper.sortArrayByProperty(dbfsItems, "label");
		}
		return dbfsItems;
	}

	static async getDBFSItem(path: string): Promise<iDatabricksFSItem> {
		let endpoint = '2.0/dbfs/get-status';
		let body = { path: path };

		let response = await this.get(endpoint, { params: body });

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
		let response = await this._apiService.get(endpoint, { params: body });
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

	static async uploadDBFSFile(localPath: string, dbfsPath: string, overwrite: boolean, batchSize: number = 1048000): Promise<void> {

		// https://2ality.com/2018/04/async-iter-nodejs.html#reading-asynchronously-via-async-iteration

		// this object is necessary so the single and asyncronous API calls are executed in the right order
		let batchesLoaded: object[] = [];

		let readStream = fs.createReadStream(localPath, { highWaterMark: batchSize });

		let handle = await this.createDBFSFile(dbfsPath, overwrite);

		for await (const chunk of readStream) {
			let response: object = await this.appendDBFSFileContent(handle, chunk.toString('base64'));

			batchesLoaded.push(response);
		}

		this.closeDBFSFile(handle);
	}

	static async downloadDBFSFile(dbfsPath: string, localPath: string, overwrite: boolean, batchSize: number = 512000): Promise<void> {

		let dbfsItem: iDatabricksFSItem = await this.getDBFSItem(dbfsPath);

		if (dbfsItem.is_dir) {
			throw "The specified path is a directory and not a file!";
		}

		// remove file if it exists
		fs.unlink(localPath, (err) => {
			if (err) throw err;
		});

		let totalSize = dbfsItem.file_size;
		let offset = 0;
		let content: { data: { bytes_read: number, data: string } };

		let writeStream = fs.createWriteStream(localPath, { highWaterMark: batchSize, encoding: 'base64' });

		do {
			if (offset + batchSize > totalSize) {
				batchSize = totalSize - offset;
			}

			content = await this.readDBFSFileContent(dbfsPath, offset, batchSize);

			writeStream.write(content.data.data, 'base64', function (err) {
				if (err) {
					vscode.window.showErrorMessage(`ERROR writing file: ${err}`);
				}
			}
			);

			offset = offset + batchSize;
		} while (offset < totalSize);

		writeStream.close();
	}


	/*
	----------------------------------------------------------------
	-- S E C R E T S   A P I
	----------------------------------------------------------------
	*/
	static async listSecretScopes(): Promise<DatabricksSecretTreeItem[]> {
		let endpoint = '2.0/secrets/scopes/list';

		let response = await this.get(endpoint);

		let result = response.data;

		// array of scopes is in result.scopes
		let items = result.scopes as iDatabricksSecretScope[];

		let scopeItems: DatabricksSecretTreeItem[] = [];
		if (items != undefined) {
			items.map(item => scopeItems.push(new DatabricksSecretTreeItem(item.name)));
			Helper.sortArrayByProperty(scopeItems, "label");
		}
		return scopeItems;
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

	static async listSecrets(scope: string): Promise<DatabricksSecretTreeItem[]> {
		let endpoint = '2.0/secrets/list';
		let body = { scope: scope };

		let response = await this.get(endpoint, { params: body });

		let result = response.data;

		// array of secrets is in result.secrets
		let items = result.secrets as iDatabricksSecret[];

		let scopeItems: DatabricksSecretTreeItem[] = [];
		if (items != undefined) {
			items.map(item => scopeItems.push(new DatabricksSecretTreeItem(scope, item.key)));
			Helper.sortArrayByProperty(scopeItems, "label");
		}
		return scopeItems;
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
}
