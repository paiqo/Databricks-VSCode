import { WorkspaceItemExportFormat, WorkspaceItemLanguage, WorkspaceItemType } from './_types';

export interface iDatabricksWorkspaceItem {
	path: string;
	object_type: WorkspaceItemType;
	object_id: number;
	language: WorkspaceItemLanguage;
}