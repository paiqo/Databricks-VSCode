import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';

import { WorkspaceItemExportFormat, WorkspaceItemLanguage, WorkspaceItemType } from './_types';
import { iDatabricksWorkspaceItem } from './iDatabricksworkspaceItem';
import { ThisExtension } from '../../../ThisExtension';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';
import { Helper } from '../../../helpers/Helper';
import { LanguageFileExtensionMapper } from './LanguageFileExtensionMapper';
import { DatabricksWorkspaceTreeItem } from './DatabricksWorkspaceTreeItem';


// https://vshaxe.github.io/vscode-extern/vscode/TreeItem.html
export class DatabricksWorkspaceNotebook extends DatabricksWorkspaceTreeItem {

	protected _isInitialized: boolean = false;
	private _onlinePathExists: boolean = true;
	private _languageFileExtension: LanguageFileExtensionMapper;

	constructor(
		path: string,
		object_id: number,
		source: "Online" | "Local",
		language: WorkspaceItemLanguage | LanguageFileExtensionMapper = undefined
	) {
		super(path, "NOTEBOOK", object_id, language instanceof LanguageFileExtensionMapper ? language.language : language, vscode.TreeItemCollapsibleState.None);

		this._object_type = "NOTEBOOK";

		if (source == "Local") {
			this._onlinePathExists = false;
		}

		if (language instanceof LanguageFileExtensionMapper) {
			this._language = language.language;
			this._languageFileExtension = language;
		}
		else {
			this._language = language;
			this._languageFileExtension = LanguageFileExtensionMapper.fromLanguage(language);
		}

		// all properties from super are evaluated BEFORE already (1st line) and may return wrong results if if not all 
		// values of this had been initialized before
		this._isInitialized = true;

		super.label = path.split('/').pop();
		super.tooltip = this._tooltip;
		super.description = this._description;
		super.contextValue = this._contextValue;
		super.iconPath = {
			light: this.getIconPath("light"),
			dark: this.getIconPath("dark")
		};
	}

	get _tooltip(): string {
		let tooltip: string = this.path + "\n";

		if (this.onlinePathExists && !this.localPathExists) {
			tooltip += "[Online only]\n";
		}
		if (!this.onlinePathExists && this.localPathExists) {
			tooltip += "[Offline only]\n";
			tooltip += "Local file extension: " + this.localFileExtension + "\n";
		}
		if (this.onlinePathExists && this.localPathExists) {
			tooltip += "[Synced]\n";
			tooltip += "Local file extension: " + this.localFileExtension + "\n";
		}
		return tooltip;
	}

	// description is show next to the label
	get _description(): string {
		let ret: string;

		ret = "[" + this.language;

		if (this._languageFileExtension.isNotebook) {
			ret += ", Notebook";
		}

		ret += "] - " + this.path;

		return ret;
	}

	// used in package.json to filter commands via viewItem == CANSTART
	get _contextValue(): string {
		if (this.localPathExists && this.onlinePathExists) { return 'CAN_SYNC'; }
		if (!this.localPathExists && this.onlinePathExists) { return 'CAN_DOWNLOAD'; }
		if (this.localPathExists && !this.onlinePathExists) { return 'CAN_UPLOAD'; }
	}

	protected getIconPath(theme: string): string {
		if (!this._isInitialized) { return null; }

		let sync_state: string = "";

		if (this.localPathExists && !this.onlinePathExists) { sync_state = "_OFFLINE"; }
		if (!this.localPathExists && this.onlinePathExists) { sync_state = "_ONLINE"; }

		return fspath.join(ThisExtension.rootPath, 'resources', theme, 'workspace', 'notebook' + sync_state + '.png');
	}

	readonly command = {
		command: 'databricksWorkspaceItem.click', title: "Open File", arguments: [this]
	};

	get localFolderPath(): string {
		return fspath.join(ThisExtension.ActiveConnection.localSyncFolder, ThisExtension.ActiveConnection.WorkspaceSubFolder, fspath.dirname(this.path));
	}

	get localFilePath(): string {
		return fspath.join(this.localFolderPath, fspath.basename(this.path) + this.localFileExtension);
	}

	get localFileUri(): vscode.Uri {
		// three '/' in the beginning indicate a local path
		// however, there are issues if this.localFilePath also starts with a '/' so we do a replace in this special case
		return vscode.Uri.parse(("file:///" + this.localFilePath).replace('////', '///'));
	}

	get localPathExists(): boolean {
		for (let ext of ThisExtension.allLanguageFileExtensions(this.language)) {
			let pathToCheck = this.localFilePath.replace(this.localFileExtension, ext);

			if (fs.existsSync(pathToCheck)) {
				this._languageFileExtension = LanguageFileExtensionMapper.fromExtension(ext);
				return true;
			}
		}
		return false;
	}

	get onlinePathExists(): boolean {
		return this._onlinePathExists;
	}

	get localFileExtension(): string {
		if (this._languageFileExtension == undefined) {
			return LanguageFileExtensionMapper.fromLanguage(this.language).extension;
		}
		return this._languageFileExtension.extension;
	}

	get exportFormat(): WorkspaceItemExportFormat {
		return this._languageFileExtension.exportFormat;
	}

	public static fromInterface(item: iDatabricksWorkspaceItem): DatabricksWorkspaceNotebook {
		let ret = new DatabricksWorkspaceNotebook(item.path, item.object_id, "Online", item.language);
		return ret;
	}

	public static fromJSON(jsonString: string): DatabricksWorkspaceNotebook {
		let item: iDatabricksWorkspaceItem = JSON.parse(jsonString);
		return DatabricksWorkspaceNotebook.fromInterface(item);
	}

	async download(asTempFile: boolean = false): Promise<string> {
		try {
			//vscode.window.showInformationMessage(`Download of item ${this._path}) started ...`);
			let localPath = this.localFilePath;
			if (asTempFile) {
				localPath = await Helper.openTempFile('', this.label + '-ONLINE', false);
				localPath += this.localFileExtension;
			}

			let response = await DatabricksApiService.downloadWorkspaceItem(this.path, localPath, this.exportFormat);

			vscode.window.showInformationMessage(`Download of item ${fspath.basename(this.path) + this.localFileExtension} finished!`);

			if (ThisExtension.RefreshAfterUpDownload && !asTempFile) {
				setTimeout(() => vscode.commands.executeCommand("databricksWorkspace.refresh", false), 500);
			}

			return localPath;
		}
		catch (error) {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		}
	}

	async upload(): Promise<void> {
		try {
			let response = DatabricksApiService.uploadWorkspaceItem(this.localFilePath, this.path, this.language, true, this.exportFormat);
			vscode.window.showInformationMessage(`Upload of item ${this.path}) finished!`);

			if (ThisExtension.RefreshAfterUpDownload) {
				setTimeout(() => vscode.commands.executeCommand("databricksWorkspace.refresh", false), 500);
			}
		}
		catch (error) {
			vscode.window.showErrorMessage(`ERROR: ${error}`);
		}
	}

	async open(showWarning: boolean = true): Promise<void> {
		if (!this.localPathExists) {
			await this.download();
		}
		else {
			if (showWarning)
				vscode.window.showWarningMessage("Opening local cached file. To open most recent file from Databricks, please manually download it first!");
		}
		let viewType:string = "default";
		if(this.localFileExtension == ".ipynb") {
			if(vscode.extensions.getExtension("ms-python.python")!= undefined)
			{
				viewType = "jupyter-notebook";
			}
			else
			{
				vscode.window.showErrorMessage("Please install extension 'ms-python.python' to open .ipynb files!");
			}
		}
		
		await vscode.commands.executeCommand('vscode.openWith', this.localFileUri, viewType);
	}

	async click(): Promise<void> {
		//if (this._languageFileExtension.isNotebook) { Helper.resetOpenAsNotebook(); }
		Helper.singleVsDoubleClick(this, this.singleClick, this.doubleClick);
	}

	async doubleClick(): Promise<void> {
		//vscode.window.showInformationMessage("DoubleClick");
		await this.open();
	}

	async singleClick(): Promise<void> {
		// TODO: This is not working properly as the "this" cannot be passed when used insided setTimeout?!?

		//vscode.window.showInformationMessage("SingleClick");
	}

	async compare(): Promise<void> {
		if (this._languageFileExtension.isNotebook) {
			vscode.window.showErrorMessage("DIFF is currently not supported when using notebooks. You can change the export formats to work around this issue!");
			return;
		}
		let onlineFileTempPath: string = await this.download(true);

		// if(this._languageFileExtension.isNotebook) { await Helper.disableOpenAsNotebook(); }
		Helper.showDiff(onlineFileTempPath, this.localFilePath);
	}
}