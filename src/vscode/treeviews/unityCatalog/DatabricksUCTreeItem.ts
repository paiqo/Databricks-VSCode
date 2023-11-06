import * as vscode from 'vscode';

import { UCTreeItemType } from './_types';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksUCTreeItem extends vscode.TreeItem {
	private _type: UCTreeItemType;
	private _name: string;
	private _parent: DatabricksUCTreeItem;
	protected _definition: any;

	constructor(
		type: UCTreeItemType,
		id: string,
		name: string,
		definition: any,
		parent?: DatabricksUCTreeItem,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);

		this._type = type;
		this._name = name;
		this._definition = definition;
		this._parent = parent;

		super.iconPath = {
				light: this.getIconPath("light"),
				dark: this.getIconPath("dark")
			};
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	protected getIconPath(theme: string): vscode.Uri {
		return vscode.Uri.joinPath(ThisExtension.rootUri, 'resources', theme, 'workspace', 'directory.png');
	}

	protected get _contextValue(): string {
		return "," + this.type.toString() + ",";
	}

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

	get parent(): DatabricksUCTreeItem {
		return this._parent;
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

	getParentByType<T = DatabricksUCTreeItem>(type: UCTreeItemType): T {
		let parent: DatabricksUCTreeItem = this.parent;

		while (parent !== undefined && parent.type !== type) {
			parent = parent.parent;
		}

		return parent as T;
	}

	async refreshParent(): Promise<void> {
		vscode.commands.executeCommand("databricksUnityCatalog.refresh", this.parent, false);
	}
}