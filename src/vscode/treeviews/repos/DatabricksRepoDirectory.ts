import * as vscode from 'vscode';
import * as fspath from 'path';
import { iDatabricksRepo, RepoProvider } from './_types';
import { Helper } from '../../../helpers/Helper';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { DatabricksRepoTreeItem } from './DatabricksRepoTreeItem';
import { DatabricksRepoRepository } from './DatabricksRepoRepository';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksRepoDirectory extends DatabricksRepoTreeItem {
	private _directory: string;

	constructor(
		directory: string,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(undefined, collapsibleState);

		this._directory = directory;

		super.label = this._directory;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		return "DIRECTORY";
	}

	protected getIconPath(theme: string): string {
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'repos', 'directory' + '.png');
	}

	public async getChildren(): Promise<DatabricksRepoTreeItem[]> {
		let responseData = await DatabricksApiService.listRepos(this._directory);

		let repoItems: DatabricksRepoTreeItem[] = [];

		if (responseData != undefined) {
			responseData.repos.map(item => repoItems.push(new DatabricksRepoRepository(item, this)));
			Helper.sortArrayByProperty(repoItems, "label", "ASC");
		}
		
		return Promise.resolve(repoItems);
	}
}