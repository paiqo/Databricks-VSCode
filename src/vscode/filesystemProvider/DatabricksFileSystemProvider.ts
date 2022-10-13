/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { DatabricksApiService } from '../../databricksApi/databricksApiService';
import { iDatabricksApiDbfsReadResponse } from '../../databricksApi/_types';
import { FSHelper } from '../../helpers/FSHelper';
import { Helper } from '../../helpers/Helper';
import { iDatabricksFSItem } from '../treeviews/dbfs/iDatabricksFSItem';

export class DatabricksFileSystemProvider implements vscode.FileSystemProvider {
	// --- manage file metadata

	async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
		// VSCode always queries for some internal files on every filesystem ?!
		if(FSHelper.isVSCodeInternalURI(uri))
		{
			throw vscode.FileSystemError.FileNotFound(uri);
		}

		const entry: iDatabricksFSItem = await DatabricksApiService.getDBFSItem(uri.path);
		if (!entry || !entry.path) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		return {
			type: entry.is_dir ? vscode.FileType.Directory : vscode.FileType.File,
			size: entry.file_size,
			mtime: entry.modification_time,
			ctime: null
		}
	}

	async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
		const entries = await DatabricksApiService.listDBFSItems(uri.path);

		const result: [string, vscode.FileType][] = [];
		for (const entry of entries) {
			result.push([Helper.getToken(entry.path, FSHelper.SEPARATOR, -1), entry.is_dir ? vscode.FileType.Directory : vscode.FileType.File]);
		}
		return result;
	}

	// --- manage file contents

	async readFile(uri: vscode.Uri): Promise<Uint8Array> {
		// VSCode always queries for some internal files on every filesystem ?!
		if(FSHelper.isVSCodeInternalURI(uri))
		{
			throw vscode.FileSystemError.FileNotFound(uri);
		}

		const dbfsItem: iDatabricksFSItem = await DatabricksApiService.getDBFSItem(uri.path);

		if (!dbfsItem) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (dbfsItem.is_dir) {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}

		let batchSize: number = 524288; // 512 kB
		const totalSize: number = dbfsItem.file_size;
		let offset: number = 0;
		let dbfsContent: iDatabricksApiDbfsReadResponse

		let contentBytesBatch: Uint8Array = new Uint8Array(batchSize);
		let contentBytes: Uint8Array = new Uint8Array(totalSize);

		while (offset < totalSize) {
			if (offset + batchSize > totalSize) {
				batchSize = totalSize - offset;
			}

			dbfsContent = await DatabricksApiService.readDBFSFileContent(dbfsItem.path, offset, batchSize);
			contentBytesBatch = Buffer.from(dbfsContent.data, 'base64');

			// add the batch to the corresponding offset of the final buffer
			contentBytes.set(contentBytesBatch, offset);

			offset = offset + batchSize;
		}

		return contentBytes
	}

	async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): Promise<void> {
		const dbfsItem: iDatabricksFSItem = await DatabricksApiService.getDBFSItem(uri.path);

		if (dbfsItem && dbfsItem.is_dir) {
			throw vscode.FileSystemError.FileIsADirectory(uri);
		}
		if (!dbfsItem && !options.create) {
			throw vscode.FileSystemError.FileNotFound(uri);
		}
		if (dbfsItem && options.create && !options.overwrite) {
			throw vscode.FileSystemError.FileExists(uri);
		}

		let handle = await DatabricksApiService.createDBFSFile(uri.path, options.overwrite);

		let batchSize: number = 524288; // 512 kB
		const totalSize = content.length;
		let offset = 0;
		while (offset < totalSize) {
			if (offset + batchSize > totalSize) {
				batchSize = totalSize - offset;
			}

			await DatabricksApiService.appendDBFSFileContent(handle, Buffer.from(content.slice(offset, offset + batchSize)).toString('base64'));
			offset = offset + batchSize;
		}

		await DatabricksApiService.closeDBFSFile(handle);

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
	}

	// --- manage files/folders

	async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {

		if (oldUri.scheme == newUri.scheme) {
			let oldDbfsItem: iDatabricksFSItem = await DatabricksApiService.getDBFSItem(oldUri.path);

			if (!oldDbfsItem) {
				throw vscode.FileSystemError.FileNotFound(oldUri);
			}
			if (oldDbfsItem.is_dir) {
				throw vscode.FileSystemError.FileIsADirectory(oldUri);
			}

			let newDbfsItem: iDatabricksFSItem = await DatabricksApiService.getDBFSItem(newUri.path);

			if (newDbfsItem && !options.overwrite) {
				throw vscode.FileSystemError.FileExists(newUri);
			}

			await DatabricksApiService.moveDBFSItem(oldUri.path, newUri.path);
		}
		else {
			await vscode.workspace.fs.writeFile(newUri, await vscode.workspace.fs.readFile(oldUri));
		}
		this._fireSoon(
			{ type: vscode.FileChangeType.Deleted, uri: oldUri },
			{ type: vscode.FileChangeType.Created, uri: newUri }
		);
	}

	async delete(uri: vscode.Uri): Promise<void> {
		await DatabricksApiService.deleteDBFSItem(uri.path, true);

		this._fireSoon({ type: vscode.FileChangeType.Changed, uri: FSHelper.parent(uri) }, { uri, type: vscode.FileChangeType.Deleted });
	}

	async createDirectory(uri: vscode.Uri): Promise<void> {
		await DatabricksApiService.createDBFSFolder(uri.path);

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
