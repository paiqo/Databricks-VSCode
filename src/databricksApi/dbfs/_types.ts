export interface iDatabricksFSItem {
	path: string;		//	The path of the file or directory.
	is_dir: boolean; 	// True if the path is a directory.
	file_size: number;	//	The length of the file in bytes or zero if the path is a directory.
}