import * as vscode from 'vscode';

import { Helper } from '../../../helpers/Helper';
import { FSHelper } from '../../../helpers/FSHelper';
import { Buffer } from '@env/buffer';

import { ExportFormatsConfiguration, ThisExtension, LocalSyncSubfolderConfiguration } from '../../../ThisExtension';
import { iDatabricksConnection } from './iDatabricksConnection';
import { DatabricksConnectionManager } from './DatabricksConnectionManager';
import { DatabricksConnectionTreeItem } from './DatabricksConnectionTreeItem';

interface DatabricksAuthProfilesOutput {
	profiles: DatabricksAuthProfile[];
}

interface DatabricksAuthProfile {
	name: string;
	host?: string;
	auth_type?: string;
	valid?: boolean;
}

interface DatabricksAuthEnvOutput {
	env?: {
		DATABRICKS_AUTH_TYPE?: string;
		DATABRICKS_CONFIG_PROFILE?: string;
		DATABRICKS_HOST?: string;
		DATABRICKS_TOKEN?: string;
	};
}

interface DatabricksAuthTokenOutput {
	access_token?: string;
}

export class DatabricksConnectionManagerCLI extends DatabricksConnectionManager {

	constructor() {
		super();
	}

	async initialize(): Promise<void> {
		ThisExtension.log("Initializing ConnectionManager CLI ...");
		this._initialized = false;

		await this.loadConnections();

		if (this._connections.length == 0) {
			let msg: string = "No connections have been configured yet! Please add a connection via the Databricks CLI config file before proceeding!";
			ThisExtension.log(msg);
			vscode.window.showErrorMessage(msg);
		}
		else {
			await super.manageLastActiveConnection();
			
			try {
				ThisExtension.log("Setting 'databricks.lastActiveConnection' to '" + this._lastActiveConnectionName + "' ...");
				ThisExtension.updateConfigurationSetting("databricks.lastActiveConnection", this._lastActiveConnectionName);
				this._initialized = true;

				await this.activateConnection(this.LastActiveConnection, true);
				
			} catch (error) {
				let msg = "Could not activate Connection '" + this._lastActiveConnectionName + "'!";
				ThisExtension.log(msg);
				vscode.window.showErrorMessage(msg);
			}
		}
	}

	async loadConnections(): Promise<void> {
		try {
			this._connections = [];

			const additionalProfileConfig = await this.readAdditionalConfigFromDatabricksCfg();
			const profiles = await this.getCliAuthProfiles();

			for (const profile of profiles) {
				try {
					const authEnv = await this.tryGetCliAuthEnv(profile.name);
					const profileConfig = additionalProfileConfig.get(profile.name);

					const hostFromCli = authEnv?.env?.DATABRICKS_HOST ?? profile.host;
					if (!hostFromCli) {
						ThisExtension.log("Could not load profile '" + profile.name + "': no Databricks host found in CLI output.");
						continue;
					}

					const newConnection: iDatabricksConnection = {
						displayName: profile.name,
						apiRootUrl: vscode.Uri.parse(hostFromCli),
						personalAccessToken: authEnv?.env?.DATABRICKS_TOKEN,
						localSyncFolder: profileConfig?.localSyncFolder ?? await FSHelper.joinPath(FSHelper.getUserDir(), "Databricks-VSCode", profile.name),
						localSyncSubfolders: profileConfig?.localSyncSubfolders,
						exportFormats: profileConfig?.exportFormats,
						_source: "CLI-profile"
					};

					// PAT is not always available for OAuth/U2M profiles; keep a profile reference for runtime token retrieval.
					if (!newConnection.personalAccessToken) {
						newConnection.personalAccessTokenSecure = {
							keyTarSettingName: undefined,
							databricksCLIProfileName: profile.name
						};
					}

					if (DatabricksConnectionTreeItem.validate(newConnection, false)) {
						this._connections.push(newConnection);
					}
					else {
						ThisExtension.log("Could not load all necessary information from CLI profile '" + profile.name + "'!");
					}
				}
				catch (profileError) {
					ThisExtension.log("Could not load Databricks CLI profile '" + profile.name + "'! " + profileError);
				}
			}
		} catch (e) {
			ThisExtension.log(`ERROR: Something went wrong loading the connections from Connection Manager 'Databricks CLI Profiles'!`);
			ThisExtension.log(e);
		}
	}

	private async getCliAuthProfiles(): Promise<DatabricksAuthProfile[]> {
		const output = await this.runDatabricksCliCommand(["auth", "profiles", "--skip-validate", "-o", "json"]);
		const parsed = JSON.parse(output) as DatabricksAuthProfilesOutput;

		if (!parsed?.profiles) {
			return [];
		}

		return parsed.profiles.filter((x) => x?.name);
	}

	private async tryGetCliAuthEnv(profileName: string): Promise<DatabricksAuthEnvOutput> {
		try {
			const output = await this.runDatabricksCliCommand(["auth", "env", "--profile", profileName, "-o", "json"]);
			return JSON.parse(output) as DatabricksAuthEnvOutput;
		}
		catch (error) {
			ThisExtension.log("Could not resolve auth env for profile '" + profileName + "'. " + error);
			return undefined;
		}
	}

	private async getCliAuthToken(profileName: string): Promise<string> {
		const output = await this.runDatabricksCliCommand(["auth", "token", "--profile", profileName, "-o", "json"]);
		const parsed = JSON.parse(output) as DatabricksAuthTokenOutput;

		return parsed?.access_token;
	}

	private async runDatabricksCliCommand(args: string[]): Promise<string> {
		if (ThisExtension.isInBrowser) {
			throw new Error("Databricks CLI integration is not available in browser mode.");
		}

		return new Promise<string>((resolve, reject) => {
			try {
				const dynamicRequire = eval("require");
				const childProcess = dynamicRequire("child_process") as typeof import("child_process");

				childProcess.execFile("databricks", args, { windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (error: Error, stdout: string, stderr: string) => {
					if (error) {
						const message = (stderr || stdout || error.message || "").trim();
						reject(new Error(message));
						return;
					}

					resolve((stdout || "").trim());
				});
			}
			catch (error) {
				reject(error);
			}
		});
	}

	private async readAdditionalConfigFromDatabricksCfg(): Promise<Map<string, {
		localSyncFolder?: vscode.Uri,
		localSyncSubfolders?: LocalSyncSubfolderConfiguration,
		exportFormats?: ExportFormatsConfiguration
	}>> {
		const result = new Map<string, {
			localSyncFolder?: vscode.Uri,
			localSyncSubfolders?: LocalSyncSubfolderConfiguration,
			exportFormats?: ExportFormatsConfiguration
		}>();

		const configFile = this.getDatabricksConfigFile();
		if (!(await FSHelper.pathExists(configFile))) {
			return result;
		}

		const data = Buffer.from(await vscode.workspace.fs.readFile(configFile)).toString('utf8');
		let currentProfile: string = undefined;

		for (let rawLine of data.split("\n")) {
			let line = rawLine.trim();
			if (line.length == 0 || line.startsWith("#") || line.startsWith(";")) {
				continue;
			}

			if (line.startsWith("[") && line.endsWith("]")) {
				currentProfile = Helper.getFirstRegexGroup(/\[([^\]]*)\]/gm, line);
				if (currentProfile && !result.has(currentProfile)) {
					result.set(currentProfile, {});
				}
				continue;
			}

			if (!currentProfile || !line.includes("=")) {
				continue;
			}

			const separator = line.indexOf("=");
			const key = line.substring(0, separator).trim();
			const value = line.substring(separator + 1).trim();
			const currentSettings = result.get(currentProfile) || {};

			try {
				switch (key) {
					case "localSyncFolder":
						currentSettings.localSyncFolder = vscode.Uri.file(value);
						break;
					case "localSyncSubfolders":
						currentSettings.localSyncSubfolders = JSON.parse(value) as LocalSyncSubfolderConfiguration;
						break;
					case "exportFormats":
						currentSettings.exportFormats = JSON.parse(value) as ExportFormatsConfiguration;
						break;
				}
			}
			catch (parseError) {
				ThisExtension.log("Ignoring invalid value for key '" + key + "' in CLI profile '" + currentProfile + "': " + parseError);
			}

			result.set(currentProfile, currentSettings);
		}

		return result;
	}

	private getDatabricksConfigFile(): vscode.Uri {
		const configFileEnv = process.env.DATABRICKS_CONFIG_FILE;
		if (configFileEnv) {
			return vscode.Uri.file(configFileEnv);
		}

		return FSHelper.joinPathSync(FSHelper.getUserDir(), ".databrickscfg");
	}

	async getAuthorizationHeaders(con: iDatabricksConnection): Promise<object> {
		if (con.personalAccessToken) {
			return super.getAuthorizationHeaders(con);
		}

		const profileName = con.personalAccessTokenSecure?.databricksCLIProfileName || con.displayName;

		try {
			const authEnv = await this.tryGetCliAuthEnv(profileName);
			if (authEnv?.env?.DATABRICKS_TOKEN) {
				return { "Authorization": 'Bearer ' + authEnv.env.DATABRICKS_TOKEN };
			}
		}
		catch (_error) {
			// Fallback handled below using databricks auth token.
		}

		const accessToken = await this.getCliAuthToken(profileName);
		if (!accessToken) {
			throw new Error("Could not obtain an authentication token from Databricks CLI profile '" + profileName + "'.");
		}

		return { "Authorization": 'Bearer ' + accessToken };
	}

	get enableJwtTokenRefresh(): boolean {
		return true;
	}

	updateConnection(updatedCon: iDatabricksConnection): void {	}

	dispose(): void { }
}