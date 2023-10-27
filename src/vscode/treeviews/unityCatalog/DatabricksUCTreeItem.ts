import * as vscode from 'vscode';

import { UCTreeItemType } from './_types';
import { Helper } from '../../../helpers/Helper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksUCTreeItem extends vscode.TreeItem {
	private _type: UCTreeItemType;
	private _name: string;
	protected _definition: any;

	constructor(
		type: UCTreeItemType,
		id: string,
		name: string,
		definition: any,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);

		this._type = type;
		this._name = name;
		this._definition = definition;
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	public async getChildren(): Promise<DatabricksUCTreeItem[]> {
		await vscode.window.showErrorMessage("getChildren is not implemented! Please overwrite in derived class!");
		return undefined;
	}


	get type(): UCTreeItemType {
		return this._type;
	}

	get name(): string {
		return this._name;
	}

	get definition(): any {
		return this._definition;
	}

	get link(): string {
		return null;
	}

	async showDefinition(): Promise<void> {
		vscode.workspace.openTextDocument({ language: "json", content: JSON.stringify(this.definition, null, "\t") }).then(
			document => vscode.window.showTextDocument(document)
		);
	}

	async openBrowser(): Promise<void> {
		await Helper.openLink(this.link);
	}

	async click(): Promise<void> {
		await Helper.singleVsDoubleClick(this, this.singleClick, this.doubleClick);
	}

	async doubleClick(): Promise<void> {
		await this.showDefinition();
	}

	async singleClick(): Promise<void> { }
}