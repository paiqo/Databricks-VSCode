import * as vscode from 'vscode';

import { ThisExtension } from '../../../ThisExtension';

import { DatabricksSecretTreeItem } from './DatabricksSecretTreeItem';


export interface iHandleDrop {
	handleDrop(dataTransfer: vscode.DataTransfer): Promise<void>;
}

class DatabricksSecretObjectTransferItem extends vscode.DataTransferItem {
	constructor(private _nodes: readonly DatabricksSecretTreeItem[]) {
		super(_nodes);
	}

	asString(): Promise<string> {
		return this.value[0].codeText;
	}
}

// https://vshaxe.github.io/vscode-extern/vscode/TreeDataProvider.html
export class DatabricksSecretDragAndDropController implements vscode.TreeDragAndDropController<DatabricksSecretTreeItem> {

	dropMimeTypes: readonly string[] = ["application/vnd.code.tree.databrickssecrets", "text/uri-list"];
	dragMimeTypes: readonly string[] = ["application/vnd.code.tree.databrickssecrets", "text/plain", "codeeditors"];

	public async handleDrag?(source: readonly DatabricksSecretTreeItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		//dataTransfer.set("application/vnd.code.tree.databrickssecrets", new DatabricksSecretObjectTransferItem(source));
		//dataTransfer.set("application/vnd.code.tree.databrickssecrets", new vscode.DataTransferItem(source));
		dataTransfer.set("text/plain", new vscode.DataTransferItem(source));
		dataTransfer.set("codeeditors", new vscode.DataTransferItem(source));
	}

	public async handleDrop?(target: DatabricksSecretTreeItem, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
		ThisExtension.log("Dropped item on " + target.itemType + " ...");

		let uriList = await dataTransfer.get("text/uri-list");
		if(uriList != null)
		{
			ThisExtension.log(await uriList.asString());
		}

		// check if target implemnts iHandleDrop interface / has handleDrop function
		if ('handleDrop' in target) {
			(target as any as iHandleDrop).handleDrop(dataTransfer);
		}
		else
		{
			ThisExtension.log("No action defined when dropping an item on a " + target.itemType + " node!");
		}
	}
}
