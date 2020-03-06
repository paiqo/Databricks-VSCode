import * as vscode from 'vscode';
import * as fspath from 'path';

import { ThisExtension } from './../../ThisExtension';
import { Helper } from '../../helpers/Helper';
import { DatabricksApiService } from './../databricksApiService';
import { SecretBackendType, SecretTreeItemType } from './_types';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSecretTreeItem extends vscode.TreeItem {
	private _path: string; // path like /secret-scope/secret-name
	private _scope: string;
	private _backend_type: SecretBackendType | undefined;
	private _secret: string;
	private _itemType: SecretTreeItemType;

	constructor(
		scope: string = undefined,
		secret: string = undefined,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super('/', collapsibleState);
		this._path = "/" + (scope == undefined ? "" : scope ) + (secret == undefined ? "" : "/" + secret );
		this._itemType = (scope == undefined ? "ROOT" : (secret == undefined ? "SCOPE" : "SECRET" ));
		this._scope = scope;
		this._secret = secret;

		super.label = this.path.split('/').pop();
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
		super.command = this.getCommand();

		// secrets should not be expandable anymore
		if(this.itemType == 'SECRET')
		{
			super.collapsibleState = undefined;
		}
	}

	

	get tooltip(): string {
		return this.path;
	}

	// description is show next to the label
	get description(): string {
		return this.path;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		return this.itemType;
	}

	private getIconPath(theme: string): string {
		let image = (this.itemType == 'SECRET' ? 'secret' : fspath.join('workspace', 'directory'));
		return fspath.join(ThisExtension.rootPath, 'resources', theme, image + '.png');
	}

	private getCommand(): vscode.Command {
		/*
		return { 
			command: 'databricksSecretItem.open', title: "Open File", arguments: [this]
		};
		*/
		return undefined;
	}


	get path (): string {
		return this._path;
	}	

	get itemType(): SecretTreeItemType {
		return this._itemType;
	}

	get scope (): string {
		return this._scope;
	}

	get secret (): string {
		return this._secret;
	}

	get backend_type (): SecretBackendType {
		if(!this._backend_type)
		{
			return 'DATABRICKS';
		}
		return this._backend_type;
	}

	getChildren(): Thenable<DatabricksSecretTreeItem[]> {
		if(this.itemType === 'ROOT')
		{
			return DatabricksApiService.listSecretScopes();
		}
		else if(this.itemType === 'SCOPE')
		{
			return DatabricksApiService.listSecrets(this.scope);
		}
		return null;
	}

	async addSecretScope(): Promise<void> {
		let scopeName = await Helper.showInputBox("<name of scope>", "The name of the secret scope to create");
		let managingPrincipal = await Helper.showQuickPick(["users"], "Which group/user is allowed to manage the secret scope");

		await DatabricksApiService.createSecretScopes(scopeName, managingPrincipal);

		Helper.wait(1000);
		vscode.commands.executeCommand("databricksSecrets.refresh", false);
	}

	async deleteSecretScope(): Promise<void> {
		if(this.itemType == 'SCOPE')
		{
			await DatabricksApiService.deleteSecretScope(this.scope);

			Helper.wait(1000);
			vscode.commands.executeCommand("databricksSecrets.refresh", false);
		}
		else
		{
			vscode.window.showErrorMessage("Invalid operation! deleteSecretScope() can only be called on itemType 'SCOPE'!");
		}
	}

	async addSecret(): Promise<void> {
		let secretName = await Helper.showInputBox("<name of secret>", "The name of the secret to create");
		let value = await Helper.showInputBox("<value for the secret>", "The value for the secret");

		await DatabricksApiService.setSecret(this.scope, secretName, value);

		Helper.wait(1000);
		vscode.commands.executeCommand("databricksSecrets.refresh", false);
	}

	async deleteSecret(): Promise<void> {
		if(this.itemType == 'SECRET')
		{
			await DatabricksApiService.deleteSecret(this.scope, this.secret);

			Helper.wait(1000);
			vscode.commands.executeCommand("databricksSecrets.refresh", false);
		}
		else
		{
			vscode.window.showErrorMessage("Invalid operation! deleteSecret() can only be called on itemType 'SECRET'!");
		}
	}
}