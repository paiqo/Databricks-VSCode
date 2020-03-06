import * as vscode from 'vscode';
import * as fspath from 'path';
import { DatabricksApiService } from '../databricksApiService';
import { ThisExtension } from '../../ThisExtension';
import { iDatabricksFSItem } from './iDatabricksFSItem';
import { Helper } from '../../helpers/Helper';


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

	async download(action:"PREVIEW" | "SAVE"): Promise<void> {
		if(!this.is_dir)
		{
			if (action == "PREVIEW")
			{
				let tempFile = await Helper.openTempFile('', this.path.split('/').slice(-1)[0], false);
				await DatabricksApiService.downloadDBFSFile(this.path, tempFile, true);

				
				vscode.workspace
					.openTextDocument(tempFile)
					.then(vscode.window.showTextDocument);
			}
			else if(action == "SAVE")
			{
				const options: vscode.SaveDialogOptions = {
					saveLabel: 'Download',
					defaultUri: vscode.Uri.parse("file:///" + this.label)
				};

				vscode.window.showSaveDialog(options).then(async fileUri => {
					if (fileUri) {
						await DatabricksApiService.downloadDBFSFile(this.path, fileUri.fsPath, true);

						vscode.window.showInformationMessage("Download to " + fileUri.fsPath + " (" + this.file_size + " bytes) completed!");
					}
				});
			}
		}
		else
		{
			throw new Error("Only a single file can be downloaded!");
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