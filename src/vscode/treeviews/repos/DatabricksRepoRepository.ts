import * as vscode from 'vscode';
import * as fspath from 'path';
import { iDatabricksRepo, RepoProvider } from './_types';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksRepoTreeItem } from './DatabricksRepoTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksRepoRepository extends DatabricksRepoTreeItem {
	
	constructor(
		id: number,
		definition: iDatabricksRepo,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
	) {
		super(collapsibleState);

		this.id = definition.id.toString();
		this._definition = definition;

		super.label = this._label;
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
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

	get _tooltip(): string {
		//return `URL: ${this.definition.url}\n Head Commit ID`;
		let ret: string = "";

		for (let [key, value] of Object.entries(this.definition)) {
			ret += `${key}: ${value}\n`;
		}

		return ret.trimEnd();
	}

	// label shown in the treeview
	get _label(): string {
		return this.definition.path.split("/").slice(3).join("/");
	}

	// description is show next to the label
	get _description(): string {
		return `${this.definition.url} (${this.definition.branch})`;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return "REPOSITORY";
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'repos', 'repo.png');
	}

	public async getChildren(): Promise<DatabricksRepoTreeItem[]> {
		return [];
	}

	get definition(): iDatabricksRepo {
		return this._definition;
	}

	get databricks_id(): number {
		return Number(this.id);
	}

	get path(): string {
		return this.definition.path;
	}

	get url(): string {
		return this.definition.url;
	}

	get provider(): RepoProvider {
		return this.definition.provider;
	}

	get branch(): string {
		return this.definition.branch;
	}

	get head_commit_id(): string {
		return this.definition.head_commit_id;
	}

	async checkOut(): Promise<iDatabricksRepo> {
		let type: string = await Helper.showQuickPick(["branch", "tag"], "Check-out repository to ");

		let target: string = await Helper.showInputBox("", `The name of the ${type} you want to check out: `);

		let branch: string = undefined;
		if (type == "branch") { branch = target; }

		let tag: string = undefined;
		if (type == "tag") { tag = target; }

		setTimeout(() => vscode.commands.executeCommand("databricksRepos.refresh", false), 2000);

		return await DatabricksApiService.updateRepo(this.databricks_id, branch, tag);		
	}

	async delete(): Promise<void> {
		await DatabricksApiService.deleteRepo(this.databricks_id);

		setTimeout(() => vscode.commands.executeCommand("databricksRepos.refresh", false), 2000);
	}
}