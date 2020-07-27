import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { JobTreeItemType, iDatabricksJobRun } from './_types';
import { iDatabricksJob } from './_types';
import { Helper } from '../../helpers/Helper';
import { DatabricksJobRun } from './DatabricksJobRun';

// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksJobTreeItem extends vscode.TreeItem {
	private _type: JobTreeItemType;
	private _databricks_id: number;
	private _name: string;
	protected _definition: iDatabricksJob | iDatabricksJobRun;

	

	constructor(
		type: JobTreeItemType,
		id: number,
		name: string,
		definition: iDatabricksJob | iDatabricksJobRun,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(name, collapsibleState);

		this._type = type;
		this._databricks_id = id;
		this._name = name;
		this._definition = definition;

		super.label = name;

		/*
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
		*/
	}

	get tooltip(): string {
		return "Tool-Tip!";
	}

	// description is show next to the label
	get description(): string {
		return "Description";
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get contextValue(): string {
		return undefined;
	}

	protected getIconPath(theme: string): string {
		return "";
	}

	readonly command = null;
	/*
	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};
	*/

	public async getChildren(): Promise<DatabricksJobTreeItem[]> {
		await vscode.window.showErrorMessage("getChildren is not implemented! Please overwrite in derived class!");
		return undefined;
	}


	get type(): JobTreeItemType {
		return this._type;
	}

	protected get databricks_id(): number {
		return this._databricks_id;
	}

	get name(): string {
		return this._name;
	}

	get definition(): iDatabricksJob | iDatabricksJobRun {
		return this.definition;
	}

	get link(): string {
		return null;
	}

	async showDefinition(): Promise<void> {
		await Helper.openTempFile(JSON.stringify(this.definition, null, "\t"), this.label + '-' + this.databricks_id + '.json');
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