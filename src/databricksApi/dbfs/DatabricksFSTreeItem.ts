import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { Helper } from '../../helpers/Helper';
import { DatabricksConnectionManager } from '../../connections/DatabricksConnectionManager';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksFSTreeItem extends vscode.TreeItem implements iDatabricksFSItem {
	private _path: string;
	private _is_dir: boolean;
	private _fileSize: number;
	
	constructor(
		path: string,
		is_dir: boolean,
		size: number,
		collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
	) {
		super(path, collapsibleState);
		this._path = path;
		this._is_dir = is_dir;
		this._fileSize = size;

		super.label = path.split('/').pop();
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};

		// files are not expandable
		if(!this.is_dir)
		{
			super.collapsibleState = undefined;
		}
	}

	get tooltip(): string {
		return `${this.path}`;
	}

	// description is show next to the label
	get description(): string {
		if(this.is_dir)
		{
			return this.path;
		}
		return `${this.path} (${Helper.bytesToSize(this.file_size)})`;
	}

	// used in package.json to filter commands via viewItem == FOLDER
	get contextValue(): string {
		if(this.is_dir)
		{
			return 'FOLDER';
		}
		let localFilePath = fspath.join(
			ThisExtension.ActiveConnection.localSyncFolder,
			DatabricksConnectionManager.DatabricksFSSubFolder,
			this.path
		);
		if (fs.existsSync(localFilePath))
		{
			return 'FILE_WITH_LOCAL_COPY';
		}
		else
		{
			return 'FILE';
		}
	}

	private getIconPath(theme: string): string {
		let itemType = (this.is_dir ? 'directory' : 'notebook');
		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', itemType + '.png');
	}

	readonly command = {
		command: 'databricksFSItem.click', title: "Preview File", arguments: [this]
	};

	get path (): string {
		return this._path;
	}

	get local_path (): string {
		return fspath.join(
			ThisExtension.ActiveConnection.localSyncFolder,
			DatabricksConnectionManager.DatabricksFSSubFolder,
			this.path
		);
	}

	get is_dir (): boolean {
		return this._is_dir;
	}

	get file_size (): number {
		return this._fileSize;
	}

	static fromJson(jsonString: string): DatabricksFSTreeItem {
		let item: iDatabricksFSItem = JSON.parse(jsonString);
		return new DatabricksFSTreeItem(item.path, item.is_dir, item.file_size);
	}

	getChildren(): Thenable<DatabricksFSTreeItem[]> {
		if(this.is_dir)
		{
			return DatabricksApiService.listDBFSItems(this.path);
		}
		return null;
	}

	async click(): Promise<void> {
		if(this.is_dir)
		{
			throw new Error("Opening of whole directory is not implemented!");
		}
		else
		{
			let localFilePath = this.local_path;
			if(!fs.existsSync(localFilePath)) {
				await this.download();
			}
			vscode.workspace
				.openTextDocument(localFilePath)
				.then(vscode.window.showTextDocument);
		}
	}

	async download(): Promise<void> {
		if(this.is_dir)
		{
			throw new Error("Download of whole directory not yet implemented!");
		}
		else
		{
			let localFilePath = this.local_path;
			if(!fs.existsSync(localFilePath))
			Helper.ensureLocalFolder(localFilePath, true);
			await DatabricksApiService.downloadDBFSFile(this.path, localFilePath, true);
			if (ThisExtension.RefreshAfterUpDownload) {
				Helper.wait(500);
				vscode.commands.executeCommand("databricksFS.refresh", false);
			}
		}
	}

	async upload(): Promise<void> {
		if(!this.is_dir)
		{
			try {
				let localFilePath = fspath.join(
					ThisExtension.ActiveConnection.localSyncFolder,
					DatabricksConnectionManager.DatabricksFSSubFolder,
					this.path
				);
				let response = DatabricksApiService.uploadDBFSFile(localFilePath, this.path, true);
				vscode.window.showInformationMessage(`Upload of item ${this.path}) finished!`);
				if (ThisExtension.RefreshAfterUpDownload) {
					Helper.wait(500);
					vscode.commands.executeCommand("databricksFS.refresh", false);
				}
			}
			catch (error) {
				vscode.window.showErrorMessage(`ERROR: ${error}`);
			}
		}
		else
		{
			throw new Error("Only a single file can be uploaded at the moment!");
		}
	}

	async add(): Promise<void> {
		if(this.is_dir)
		{
			let files: vscode.Uri[] = await vscode.window.showOpenDialog({ canSelectMany: true });

			let file: vscode.Uri = files[0];
			for(let fileNum in files)
			{
				let dbfsPath = fspath.join(this.path, fspath.basename(files[fileNum].fsPath)).split('\\').join('/');
				let response = DatabricksApiService.uploadDBFSFile(files[fileNum].fsPath, dbfsPath, true );

				response.catch((error) => {
					vscode.window.showErrorMessage(`ERROR: ${error}`);
				}).then(() => {
					vscode.window.showInformationMessage(`Upload of item ${dbfsPath} finished!`);

					if(ThisExtension.RefreshAfterUpDownload)
					{
						Helper.wait(500);
						vscode.commands.executeCommand("databricksFS.refresh", false);
					}
				});
			}
		}
		else
		{
			throw new Error("A new file can only be added to a directory!");
		}
	}

	async delete(): Promise<void> {
		if (!this.is_dir) {
			DatabricksApiService.deleteDBFSItem(this.path, false);

			Helper.wait(500);
			vscode.commands.executeCommand("databricksFS.refresh", false);
		}
		else {
			throw new Error("For safety reasons, only a single file can be deleted!");
		}

	}
}