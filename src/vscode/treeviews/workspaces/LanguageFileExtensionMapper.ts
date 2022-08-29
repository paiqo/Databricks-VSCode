import * as vscode from 'vscode';

import { WorkspaceItemExportFormat, WorkspaceItemLanguage } from './_types';
import { ThisExtension, ExportFormatsConfiguration } from '../../../ThisExtension';

export class LanguageFileExtensionMapper {
	private _language: WorkspaceItemLanguage;
	private _extension: string;
	private _exportFormat: WorkspaceItemExportFormat;
	private _isNotebook: boolean;

	constructor() { }

	static get exportFormat(): ExportFormatsConfiguration {
		return ThisExtension.ActiveConnection.exportFormats;
	}

	static get supportedFileExtensions(): string[] {
		return [
			this.exportFormat.Python,
			this.exportFormat.R,
			this.exportFormat.SQL,
			this.exportFormat.Scala
		];
	}

	get language(): WorkspaceItemLanguage {
		return this._language;
	}

	get extension(): string {
		return this._extension;
	}

	get exportFormat(): WorkspaceItemExportFormat {
		return this._exportFormat;
	}

	get isNotebook(): boolean {
		return this._isNotebook;
	}

	static fromLanguage(language: WorkspaceItemLanguage): LanguageFileExtensionMapper {
		if(language == undefined)
		{
			return undefined;
		}
		
		let ret: LanguageFileExtensionMapper = new LanguageFileExtensionMapper();

		ret._language = language;

		switch (language) {
			case "PYTHON":
				ret._extension = this.exportFormat.Python;
				break;
			case "R":
				ret._extension = this.exportFormat.R;
				break;
			case "SCALA":
				ret._extension = this.exportFormat.Scala;
				break;
			case "SQL":
				ret._extension = this.exportFormat.SQL;
				break;
			default: throw new Error("ExportFormat for Language '" + language + "' is not defined!");
		}

		if (ret.extension.endsWith('.ipynb')) {
			ret._isNotebook = true;
			ret._exportFormat = "JUPYTER";
		}
		else {
			ret._isNotebook = false;
			ret._exportFormat = "SOURCE";
		}

		return ret;
	}

	static fromExtension(extension: string): LanguageFileExtensionMapper {
		let ret: LanguageFileExtensionMapper = new LanguageFileExtensionMapper();

		ret._extension = extension.toLowerCase();

		ret._isNotebook = false;
		ret._exportFormat = "SOURCE";

		switch (ret.extension) {
			case ".py":
				ret._language = "PYTHON";
				break;
			case ".py.ipynb":
			case ".ipynb":
				ret._language = "PYTHON";
				ret._isNotebook = true;
				ret._exportFormat = "JUPYTER";
				break;
			case ".r":
				ret._language = "R";
				break;
			case ".Rmd":
				ret._language = "R";
				break;
			case ".scala":
				ret._language = "SCALA";
				break;
			case ".sql":
				ret._language = "SQL";
				break;
			default: 
				ThisExtension.log("Invalid file extension found: " + ret.extension);
				//throw new Error("Language for extension '" + ret.extension + "' is not defined!");
				return undefined;				
		}

		return ret;
	}

	static extensionFromFileName(fileName: string): string {
		if (fileName.endsWith(".py.ipynb")) {
			return ".py.ipynb";
		}

		let tokens = fileName.split('.'); // e.g. '.ipynb' or '.scala'

		if(tokens.length == 1)
		{
			return undefined;
		}
		return "." + tokens.slice(-1)[0];
	}

	static fromFileName(fileName: string): LanguageFileExtensionMapper {
		let extension: string = this.extensionFromFileName(fileName);
		if(!extension)
		{
			return undefined;
		}
		return this.fromExtension(extension);
	}

	static fromUri(uri: vscode.Uri): LanguageFileExtensionMapper {
		return this.fromFileName(uri.path);
	}
}