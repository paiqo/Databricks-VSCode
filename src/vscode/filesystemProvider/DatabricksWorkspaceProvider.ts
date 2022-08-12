/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/


import * as vscode from 'vscode';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { FSHelper } from '../../helpers/FSHelper';
import { iDatabricksWorkspaceItem } from '../treeviews/workspaces/iDatabricksworkspaceItem';
import { WorkspaceItemLanguage } from '../treeviews/workspaces/_types';

export class DatabricksWorkspaceProviderFile implements vscode.FileStat {

    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;
	
	fileName: string;
	language: WorkspaceItemLanguage;

    constructor(fileName: string) {
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;

		this.fileName = fileName;
		this.language = "PYTHON";
    }
}

export class DatabricksWorkspaceProvider implements vscode.FileSystemProvider {
	// --- manage file metadata

	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		const entry: iDatabricksWorkspaceItem = await DatabricksApiService.getWorkspaceItem(uri.path);
		if (!entry) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		return {
			type: entry.object_type == "DIRECTORY" ? vscode.FileType.Directory : vscode.FileType.File,
			size: null,
			mtime: null,
			ctime: null
		}
	}

	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		const entries = await DatabricksApiService.listWorkspaceItems(uri.path);

		const result: [string, vscode.FileType][] = [];
		for (const entry of entries) {
			result.push([entry.path, entry.object_type == "DIRECTORY" ? vscode.FileType.Directory : vscode.FileType.File]);
		}
		return result;
	}

	// --- manage file contents

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		let remoteItem: iDatabricksWorkspaceItem = await DatabricksApiService.getWorkspaceItem(uri.path);

		if (!remoteItem) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (remoteItem.object_type == "DIRECTORY") {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}

		let contentBytes: Uint8Array = await DatabricksApiService.downloadWorkspaceItem(uri.path, "SOURCE");

		return contentBytes
	}

	async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): Promise<void> {
		let remoteItem: iDatabricksWorkspaceItem = await DatabricksApiService.getWorkspaceItem(uri.path);

		if (remoteItem && remoteItem.object_type == "DIRECTORY") {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}
		if (!remoteItem && !options.create) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (remoteItem && options.create && !options.overwrite) {
			throw vscode.FileSystemError.FileExists(uri);
		}
		if(!remoteItem)
		{
			// e.g. when a new file is created
			// get extension from new file -> derive language, etc.
		}
		await DatabricksApiService.uploadWorkspaceItem(content, uri.path, remoteItem.language, options.overwrite);

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
		await DatabricksApiService.deleteWorkspaceItem(uri.path, true);

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
