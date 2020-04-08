import * as vscode from 'vscode';
import * as fspath from 'path';
import * as fs from 'fs';

import { WorkspaceItemExportFormat, WorkspaceItemLanguage } from './_types';
import { ThisExtension, ExportFormatsConfiguration } from '../../ThisExtension';

export class LanguageFileExtensionMapper {
	private _language: WorkspaceItemLanguage;
	private _extension: string;
	private _languageExtension: string;
	private _notebookExtension: string;
	private _originalExtension: string;
	private _exportFormat: WorkspaceItemExportFormat;
	private _isNotebook: boolean;

	constructor() { }

	static get exportFormatConfigs(): ExportFormatsConfiguration {
		return ThisExtension.ActiveConnection.exportFormatsConfiguration;
	}

	static get supportedFileExtensions(): string[] {
		return [
			this.exportFormatConfigs.Python,
			this.exportFormatConfigs.R,
			this.exportFormatConfigs.SQL,
			this.exportFormatConfigs.Scala
		];
	}

	get language(): WorkspaceItemLanguage {
		return this._language;
	}

	get extension(): string {
		if (this._originalExtension) { return this._originalExtension; }

		return this._extension;
	}

	get languageExtension(): string {
		return this._languageExtension;
	}

	get notebookExtension(): string {
		return this._notebookExtension;
	}

	get originalExtension(): string {
		return this._originalExtension;
	}

	get exportFormat(): WorkspaceItemExportFormat {
		return this._exportFormat;
	}

	get isNotebook(): boolean {
		return this._isNotebook;
	}

	static fromLanguage(language: WorkspaceItemLanguage): LanguageFileExtensionMapper {
		let ret: LanguageFileExtensionMapper = new LanguageFileExtensionMapper();

		ret._language = language;

		switch (language) {
			case "PYTHON":
				ret._extension = this.exportFormatConfigs.Python;
				break;
			case "R":
				ret._extension = this.exportFormatConfigs.R;
				break;
			case "SCALA":
				ret._extension = this.exportFormatConfigs.Scala;
				break;
			case "SQL":
				ret._extension = this.exportFormatConfigs.SQL;
				break;
			default: throw new Error("ExportFormat for Language '" + language + "' is not defined!");
		}

		let tokens = ret.extension.split('.'); // e.g. '.py.ipynb'
		if (ret.extension.endsWith('.ipynb')) {
			ret._isNotebook = true;
			ret._notebookExtension = '.ipynb';
			ret._languageExtension = tokens[1];
			ret._exportFormat = "JUPYTER";
		}
		else {
			ret._isNotebook = false;
			ret._notebookExtension = '';
			ret._languageExtension = tokens[1];
			ret._exportFormat = "SOURCE";
		}

		return ret;
	}

	static fromExtension(extension: string): LanguageFileExtensionMapper {
		let ret: LanguageFileExtensionMapper = new LanguageFileExtensionMapper();

		ret._extension = extension;
		ret._originalExtension = extension;

		let tokens = ret.extension.split('.'); // e.g. '.py.ipynb'
		if (ret.extension.endsWith('.ipynb')) {
			ret._isNotebook = true;
			ret._notebookExtension = '.ipynb';
			ret._languageExtension = '.' + tokens[1];
			ret._exportFormat = "JUPYTER";
		}
		else {
			ret._isNotebook = false;
			ret._notebookExtension = '';
			ret._languageExtension = '.' + tokens[1];
			ret._exportFormat = "SOURCE";
		}

		switch (ret.languageExtension) {
			case ".py":
				ret._language = "PYTHON";
				break;
			case ".r":
				ret._language = "R";
				break;
			case ".scala":
				ret._language = "SCALA";
				break;
			case ".sql":
				ret._language = "SQL";
				break;
			default: throw new Error("Language for extensions '" + ret.languageExtension + "' is not defined!");
		}

		return ret;
	}

	static extensionFromFileName(fileName: string): string {
		let tokens = fileName.split('.'); // e.g. '.py.ipynb'
		let extensionTokens: string[];
		if (tokens.slice(-1)[0] == "ipynb") {
			extensionTokens = tokens.slice(-2);
		}
		else {
			extensionTokens = tokens.slice(-1);
		}
		return '.' + extensionTokens.join('.');
	}

	static fromFileName(fileName: string): LanguageFileExtensionMapper {
		return this.fromExtension(this.extensionFromFileName(fileName));
	}
}