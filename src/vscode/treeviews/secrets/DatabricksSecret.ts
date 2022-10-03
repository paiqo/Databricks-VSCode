import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';
import { Helper } from '../../../helpers/Helper';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { iDatabricksSecret } from './iDatabricksSecret';
import { DatabricksSecretScope } from './DatabricksSecretScope';
import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksSecret extends DatabricksSecretTreeItem {
	private _secret: string;
	private _scope: DatabricksSecretScope;

	constructor(
		definition: iDatabricksSecret,
		scope: DatabricksSecretScope
	) {
		super("SECRET", definition.key, scope, vscode.TreeItemCollapsibleState.None);
		this._secret = definition.key;
		this._scope = scope;

		super.label = definition.key;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return "SECRET_" + this._scope.BackendType;
	}

	private getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootPath, 'resources', theme, 'secret.png');
	}

	get scope(): string {
		return this._scope.Scope;
	}

	get secret(): string {
		return this._secret;
	}

	async update(): Promise<void> {
		let newValue = await Helper.showInputBox("<new value for the '" + this.secret + "'>", "The new value for the secret '" + this.secret + "'");

		await DatabricksApiService.setSecret(this.scope, this.secret, newValue);

		setTimeout(() => this.refreshParent(), 500);
	}

	async delete(): Promise<void> {
		let confirm: string = await Helper.showQuickPick(["yes", "no"], "Confirm deletion of secret " + this.scope + "/" + this.secret);

		if (!confirm || confirm == "no") {
			ThisExtension.log("Deletion of secret '" + this.scope + "/" + this.secret + "' aborted!")
			return;
		}

		if (!confirm || confirm == "yes") {
			await DatabricksApiService.deleteSecret(this.scope, this.secret);

			setTimeout(() => this.refreshParent(), 500);
		}
	}
}