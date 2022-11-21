import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { SecretBackendType } from './_types';
import { iDatabricksSecretScope } from './iDatabricksSecretScope';
import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';
import { DatabricksSecret } from './DatabricksSecret';
import { iDatabricksSecret } from './iDatabricksSecret';
import { FSHelper } from '../../../helpers/FSHelper';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSecretScope extends DatabricksSecretTreeItem {
	private _scope: string;
	private _scope_backend_type: SecretBackendType | undefined;

	constructor(
		definition: iDatabricksSecretScope
	) {
		super("SCOPE", definition.name, null, vscode.TreeItemCollapsibleState.Collapsed);
		this._scope = definition.name;
		this._scope_backend_type = definition.backend_type;

		super.label = definition.name;
		super.contextValue = this._contextValue;
		super.description = this._description;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return this.itemType + "_" + this.BackendType;
	}

	private get _description(): string {
		if (this.BackendType == "AZURE_KEYVAULT") {
			return "READ-ONLY";
		}
		return "";
	}

	private getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, 'workspace', 'directory' + '.png');
	}

	get Scope(): string {
		return this._scope;
	}

	get BackendType(): SecretBackendType {
		return this._scope_backend_type;
	}

	async getChildren(): Promise<DatabricksSecretTreeItem[]> {
		let items: iDatabricksSecret[] = await DatabricksApiService.listSecrets(this.Scope);

		let secretItems: DatabricksSecret[] = []

		if (items != undefined) {
			items.map(item => secretItems.push(new DatabricksSecret(item, this)));
		}

		return secretItems;
	}

	get codeText(): string {
		return `dbutils.secrets.list("${this.Scope}")`;
	}

	async delete(): Promise<void> {
		let confirm: string = await Helper.showInputBox("", "Confirm deletion by typeing the Scope name '" + this.Scope + "' again.", true);
		if (!confirm) {
			ThisExtension.log("Deletion of secret scope '" + this.Scope + "' aborted!")
			return;
		}

		if (confirm == this.Scope) {
			await DatabricksApiService.deleteSecretScope(this.Scope);

			setTimeout(() => this.refreshParent(), 500);
		}
	}

	async addSecret(): Promise<void> {
		let secretName = await Helper.showInputBox("<name of secret>", "The name of the secret to create", true);
		if(!secretName) // abort on ESC or empty value
		{
			ThisExtension.log("Adding new secret: No secret name provided -> Aborting!")
			return;
		}
		let value = await Helper.showInputBox("<value for '" + secretName + "'>", "The value for the secret '" + secretName + "'", true);
		if(value == undefined) // abort on ESC
		{
			ThisExtension.log("Adding new secret: ESC pressed -> Aborting!")
			return;
		}

		await DatabricksApiService.setSecret(this.Scope, secretName, value);

		setTimeout(() => this.refreshParent(), 500);
	}
}