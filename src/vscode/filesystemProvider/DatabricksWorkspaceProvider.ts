import * as vscode from 'vscode';

import { FSHelper } from '../../helpers/FSHelper';
import { LanguageFileExtensionMapper } from '../treeviews/workspaces/LanguageFileExtensionMapper';
import { WorkspaceItemExportFormat, WorkspaceItemLanguage, WorkspaceItemType } from '../treeviews/workspaces/_types';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';

import { iDatabricksWorkspaceItem } from '../treeviews/workspaces/iDatabricksworkspaceItem';
import { Helper } from '../../helpers/Helper';

export class DatabricksWorkspaceProviderItem implements vscode.FileStat, iDatabricksWorkspaceItem {
	// vscode.FileStat properties, basically all are read-only
	get ctime(): number {
		return Date.now() - 1000;
	}

	get mtime(): number {
		return Date.now() - 1000;
	}

	get size(): number {
		return 0;
	}

	get type(): vscode.FileType {
		if(["FILE"].includes(this.object_type))
		{
			//return vscode.FileType.Unknown;
			return vscode.FileType.File;
		}
		if (["DIRECTORY", "REPO"].includes(this.object_type) || !this.mapper) {
			return vscode.FileType.Directory;
		}
		if (["NOTEBOOK"].includes(this.object_type) || this.mapper) {
			return vscode.FileType.File;
		}
		return undefined;
	}


	// iDatabricksWorkspaceItem properties
	object_id: number;
	object_type: WorkspaceItemType;
	path: string;

	mapper: LanguageFileExtensionMapper;

	constructor() { }

	get showInFilesystem(): boolean {
		return (this.type != undefined);
	}

	get filesystemEntry(): [string, vscode.FileType] {
		return [Helper.getToken(this.uriPath, FSHelper.SEPARATOR, -1), this.type];
	}

	get exists(): boolean {
		if (this.object_id == -1) {
			return false;
		}

		return true;
	}

	// the path used when communicating with the API
	get apiPath(): string {
		return this.path;
	}

	set apiPath(value: string) {
		this.path = value;
	}

	// the path used when used as URI
	get uriPath(): string {
		if (this.type == vscode.FileType.File && this.mapper) {
			return this.path + this.mapper.extension;
		}
		
		return this.path;
	}

	set uriPath(value: string) {
		if (this.type == vscode.FileType.Directory) {
			this.path = value;
		}
		if (this.type == vscode.FileType.File) {
			this.path = value.replace(this.mapper.extension, "");
		}
	}

	get exportFormat(): WorkspaceItemExportFormat {
		return this.mapper.exportFormat;
	}

	get isNotebook(): boolean {
		if (this.mapper) {
			return this.mapper.isNotebook;
		}
		return false;
	}

	get language(): WorkspaceItemLanguage {
		if (this.mapper) {
			return this.mapper.language;
		}
		return undefined;
	}

	set language(value: WorkspaceItemLanguage) {
		if (value) {
			this.mapper = LanguageFileExtensionMapper.fromLanguage(value);
		}
		else {
			this.mapper = undefined;
		}
	}

	async loadFromAPI(): Promise<void> {
		const item: iDatabricksWorkspaceItem = await DatabricksApiService.getWorkspaceItem(this.apiPath);

		if (!item) {
			this.object_id = -1;
		}
		else {
			this.path = item.path;
			this.language = item.language;
			this.object_id = item.object_id;
			this.object_type = item.object_type;
		}
	}

	static async getInstance(source: vscode.Uri | iDatabricksWorkspaceItem): Promise<DatabricksWorkspaceProviderItem> {
		let newInstance: DatabricksWorkspaceProviderItem = new DatabricksWorkspaceProviderItem();
		if (source instanceof vscode.Uri) {
			// VSCode always queries for some internal fiels on every filesystem
			if (source.path.startsWith("/.vscode")) {
				return undefined;
			}
			newInstance.mapper = LanguageFileExtensionMapper.fromUri(source);
			newInstance.uriPath = source.path;
			await newInstance.loadFromAPI();
		}
		else {
			// from API
			newInstance.mapper = LanguageFileExtensionMapper.fromLanguage(source.language)
			newInstance.apiPath = source.path;
			newInstance.object_id = source.object_id;
			newInstance.object_type = source.object_type;
			newInstance.language = source.language;
		}

		return newInstance;
	}
}

export class DatabricksWorkspaceProvider implements vscode.FileSystemProvider {
	// --- manage file metadata

	async stat(uri: vscode.Uri): Promise<DatabricksWorkspaceProviderItem> {
		let entry = await DatabricksWorkspaceProviderItem.getInstance(uri);

		if (!entry || !entry.exists) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}

		return entry;
	}

	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		// URI and API path are the same for directories
		const entries = await DatabricksApiService.listWorkspaceItems(uri.path);

		const result: [string, vscode.FileType][] = [];
		for (const entry of entries) {
			let item = await DatabricksWorkspaceProviderItem.getInstance(entry);

			if (item.showInFilesystem) {
				result.push(item.filesystemEntry);
			}
		}
		return result;
	}

	// --- manage file contents

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		let remoteItem: DatabricksWorkspaceProviderItem = await DatabricksWorkspaceProviderItem.getInstance(uri);

		if (!remoteItem.exists) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (remoteItem.type == vscode.FileType.Directory) {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}

		let contentBytes: Uint8Array = await DatabricksApiService.downloadWorkspaceItem(remoteItem.apiPath, remoteItem.exportFormat);

		return contentBytes
	}

	async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): Promise<void> {
		let remoteItem: DatabricksWorkspaceProviderItem = await DatabricksWorkspaceProviderItem.getInstance(uri);

		if (remoteItem.exists && remoteItem.type == vscode.FileType.Directory) {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}
		if (!remoteItem.exists && !options.create) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (remoteItem.exists && options.create && !options.overwrite) {
			throw vscode.FileSystemError.FileExists(uri);
		}
		// when a new file is added (remote does not yet exists and no content is provided), we just upload an empty file in SOURCE format.
		if (!remoteItem.exists && content.length == 0) {
			await DatabricksApiService.uploadWorkspaceItem(content, remoteItem.apiPath, remoteItem.language, options.overwrite, "SOURCE");
		}
		else {
			await DatabricksApiService.uploadWorkspaceItem(content, remoteItem.apiPath, remoteItem.language, options.overwrite, remoteItem.exportFormat);
		}

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
	}

	// --- manage files/folders

	async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {

		// there is no rename in the API so we simply read and write the file
		await vscode.workspace.fs.writeFile(newUri, await vscode.workspace.fs.readFile(oldUri));
		this._fireSoon(
			{ type: vscode.FileChangeType.Deleted, uri: oldUri },
			{ type: vscode.FileChangeType.Created, uri: newUri }
		);
	}

	async delete(uri: vscode.Uri): Promise<void> {
		let remoteItem: DatabricksWorkspaceProviderItem = await DatabricksWorkspaceProviderItem.getInstance(uri);
		await DatabricksApiService.deleteWorkspaceItem(remoteItem.apiPath, true);

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri: FSHelper.parent(uri) }, { uri, type: vscode.FileChangeType.Deleted });
	}

	async createDirectory(uri: vscode.Uri): Promise<void> {
		await DatabricksApiService.createWorkspaceFolder(uri.path);

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri: FSHelper.parent(uri) }, { type: vscode.FileChangeType.Created, uri });
	}


	// --- manage file events

	private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
	private _bufferedEvents: vscode.FileChangeEvent[] = [];
	private _fireSoonHandle?: NodeJS.Timer;

	readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

	watch(_resource: vscode.Uri): vscode.Disposable {
		// ignore, fires for all changes...
		return new vscode.Disposable(() => { });
	}

	private _fireSoon(...events: vscode.FileChangeEvent[]): void {
		this._bufferedEvents.push(...events);

		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle);
		}

		this._fireSoonHandle = setTimeout(() => {
			this._emitter.fire(this._bufferedEvents);
			this._bufferedEvents.length = 0;
		}, 5);
	}
}
