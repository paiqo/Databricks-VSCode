import * as vscode from 'vscode';

import { iDatabricksRepo, RepoProvider } from './_types';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksRepoTreeItem } from './DatabricksRepoTreeItem';
import { FSHelper } from '../../../helpers/FSHelper';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksRepoRepository extends DatabricksRepoTreeItem {
	
	constructor(
		definition: iDatabricksRepo,
		parent?: DatabricksRepoTreeItem,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
	) {
		super(parent, collapsibleState);

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
		return `(${this.definition.branch}) ${this.definition.url}`;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return "REPOSITORY";
	}

	protected getIconPath(theme: string): vscode.Uri {
		return FSHelper.joinPathSync(ThisExtension.rootUri, 'resources', theme, 'repos', 'repo.png');
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
		if(!type) // if the user does not click anything we abort
		{
			ThisExtension.log("CheckOut of repo '" + this.label + "' aborted!");
			return;
		}

		let target: string = await Helper.showInputBox("", `The name of the ${type} you want to check out: `, true);
		if(!target) // if the user does not click anything we abort
		{
			ThisExtension.log("CheckOut of repo '" + this.label + "' aborted!");
			return;
		}

		let branch: string = undefined;
		if (type == "branch") { branch = target; }

		let tag: string = undefined;
		if (type == "tag") { tag = target; }

		let ret: iDatabricksRepo = await DatabricksApiService.updateRepo(this.databricks_id, branch, tag);		

		setTimeout(() => this.refreshParent(), 500);

		return ret;
	}

	async pull(): Promise<iDatabricksRepo> {
		
		let branch: string = this.definition.branch;
		let tag: string = this.definition.tag;

		let ret: iDatabricksRepo = await DatabricksApiService.updateRepo(this.databricks_id, branch, tag);		

		setTimeout(() => this.refreshParent(), 500);

		return ret;
	}

	async delete(): Promise<void> {
		let confirm: string = await Helper.showInputBox("", "Confirm deletion by typeing the repo name '" + this.label + "' again.", true);
		if (!confirm || confirm != this.label) {
			ThisExtension.log("Deletion of repo '" + this.label + "' aborted!");
			return;
		}

		await DatabricksApiService.deleteRepo(this.databricks_id);

		setTimeout(() => this.refreshParent(), 500);
	}
}