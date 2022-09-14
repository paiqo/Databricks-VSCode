import { PublicApi } from "@databricks/databricks-vscode-types";
import { DatabricksConnectionManager } from "./DatabricksConnectionManager";
import { iDatabricksConnection } from "./iDatabricksConnection";
import {fromConfigFile} from "@databricks/databricks-sdk-js";

export class DatabricksConnectionManagerBricks extends DatabricksConnectionManager {
	constructor(private databricksApi: PublicApi) {
		super();
		this._initialized = true;
	}

	async initialize(): Promise<void> {
		await this.databricksApi.connectionManager.waitForConnect();

		this._connections = [{
			displayName: "Databricks Extension",
			personalAccessToken: "",
			personalAccessTokenSecure: {
				keyTarSettingName: undefined,
				databricksCLIProfileName: this.databricksApi.connectionManager.profile
			},
			apiRootUrl: "",
			localSyncFolder: "",
			useCodeCells: true,
		
			_source: "CLI-profile"
		}];
		console.log(this._connections[0])

		let credentialProvider = fromConfigFile(this._connections[0].personalAccessTokenSecure!.databricksCLIProfileName!);
		let creds = await credentialProvider();

		this._connections[0].apiRootUrl = creds.host.toString();
		this._connections[0].personalAccessToken = creds.token;

		this._lastActiveConnectionName = this._connections[0].displayName;
		await this.activateConnection(this._connections[0], false);
	}

	loadConnections(): void {
		console.log("load connections")
		//throw new Error("Method not implemented.");
	}

	updateConnection(updatedCon: iDatabricksConnection): void {
		console.log("update connection", updatedCon);
		//throw new Error("Method not implemented.");
	}
	
	async getAccessToken(con: iDatabricksConnection): Promise<string> {
		return con.personalAccessToken;
	}

}