export interface iSQLTableColumn {
	name: string;
	dataType: string;
	comment: string;
}

export interface iSQLTableProperty {
	key: string;
	value: string;
}

export interface iSQLTableDetails {
	createStatement: string;
	databaseName: string;
	name: string;
	type: string;
	comment?: string;
	isManaged: boolean;
	format: string;
	location: string;
	isTemporary: boolean;
	columns: iSQLTableColumn[];
	partitioningColumns: iSQLTableColumn[];
	tableProperties: iSQLTableProperty[];
	sqlViewStatement?: string;
}