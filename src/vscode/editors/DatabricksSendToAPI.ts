import * as vscode from 'vscode';
import { DatabricksSendToApiConfig } from './_types';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { json } from 'stream/consumers';
import { error } from 'console';
import { Helper } from '../../helpers/Helper';

export class DatabricksSendToAPI {

	static async sendToAPI(resourceUri: vscode.Uri): Promise<void> {

		// APIs only support JSON files so we check if the JSON is valid first
		const body: string = vscode.window.activeTextEditor.document.getText();
		let jsonBody;
		try {
			jsonBody = JSON.parse(body);
		}
		catch (error) {
			vscode.window.showErrorMessage("Invalid JSON!", { modal: true });
			return;
		}

		const apiConfig: DatabricksSendToApiConfig[] = [
			{
				label: "Clusters", refreshCommand: "databricksClusters.refresh", endpoints: [
					{ label: "create", endpoint: "2.0/clusters/create", method: "POST", helpLink: vscode.Uri.parse("https://docs.databricks.com/dev-tools/api/latest/clusters.html#create") },
					{ label: "update", endpoint: "2.0/clusters/edit", method: "POST", helpLink: vscode.Uri.parse("https://docs.databricks.com/dev-tools/api/latest/clusters.html#edit") }
				]
			},
			{
				label: "Jobs", refreshCommand: "databricksJobs.refresh", endpoints: [
					{ label: "create", endpoint: "2.1/jobs/create", method: "POST", helpLink: vscode.Uri.parse("https://docs.databricks.com/dev-tools/api/latest/jobs.html#operation/JobsCreate") },
					{ label: "overwrite", endpoint: "2.1/jobs/reset", method: "POST", helpLink: vscode.Uri.parse("https://docs.databricks.com/dev-tools/api/latest/jobs.html#operation/JobsReset") },
					{ label: "update", endpoint: "2.1/jobs/update", method: "POST", helpLink: vscode.Uri.parse("https://docs.databricks.com/dev-tools/api/latest/jobs.html#operation/JobsUpdate") }
				]
			}
		]
		const rootApi = await vscode.window.showQuickPick(apiConfig);

		if (!rootApi) { return; }

		const endpoint = await vscode.window.showQuickPick((await rootApi).endpoints);

		if (!endpoint) { return; }

		let response;
		switch (endpoint.method) {
			case "POST":
				response = await DatabricksApiService.post(endpoint.endpoint, jsonBody, "JSON");
				break;

			case "PATCH":
				response = await DatabricksApiService.patch(endpoint.endpoint, jsonBody);
				break;

			default:
				throw new Error("Not yet implemented!");
		}

		if (response.error_code) {
			let choice = await vscode.window.showErrorMessage(
				`${response.error_code}\n${response.message}`,
				{ modal: true, detail: endpoint.helpLink.toString() },
				"Open Docs");
			if (choice == "Open Docs") {
				Helper.openLink(endpoint.helpLink.toString());
			}
		}
		else {
			vscode.commands.executeCommand(rootApi.refreshCommand);
		}
	}
}

