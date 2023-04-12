
import * as vscode from 'vscode';

import { ContextLanguage, ExecutionContext } from "../../../databricksApi/_types";

export type WidgetType =
	"text"
	| "combobox"
	| "dropdown"
	| "multiselect"
	;

export abstract class DatabricksWidget<T = string | string[]> implements vscode.QuickPickItem {
	static WidgetRegExPositional: RegExp;
	static WidgetRegExNamed: RegExp
	static WidgetRegExSQL: RegExp

	language: ContextLanguage;
	type: WidgetType;
	name: string;
	defaultValue?: string;
	label: string;

	lastInput: T;

	constructor(language: ContextLanguage, type: WidgetType, name: string, defaultValue?: string, label?: string) {
		this.language = language;
		this.type = type as WidgetType;
		this.name = name;
		this.defaultValue = defaultValue ?? "";
		this.label = label ?? this.name;
	}

	static loadFromCommandText(commandText: string, language: ContextLanguage): DatabricksWidget[] {
		let widgets: DatabricksWidget[] = [];

		if (this.WidgetRegExPositional) {
			widgets = widgets.concat(this.parseRegEx(commandText, this.WidgetRegExPositional, language));
		}
		if (this.WidgetRegExNamed) {
			widgets = widgets.concat(this.parseRegEx(commandText, this.WidgetRegExNamed, language));
		}
		if (this.WidgetRegExSQL) {
			widgets = widgets.concat(this.parseRegEx(commandText, this.WidgetRegExSQL, language));
		}

		return widgets;
	}

	abstract promptForInput(executionContext?: ExecutionContext, useCached?: boolean): Promise<T>;

	abstract getInput(executionContext: ExecutionContext, force?: boolean): Promise<T>;

	abstract getCommandTextValue(): string;

	static parseRegEx(commandText: string, regex: RegExp, language: ContextLanguage): DatabricksWidget[] {
		throw new Error("Not implemented");
	}

	async replaceInCommandText(commandText: string): Promise<string> {
		const regexCode = new RegExp("dbutils\\.widgets\\.get\\s*\\([\"']{1}" + this.name + "[\"']\\)");
		const regexSQL = new RegExp("\\$\\{" + this.name + "\\}");
		const regexSQLArgument = new RegExp("getArgument\('" + this.name + "\)'");

		commandText = commandText.replace(regexCode, (await this.getCommandTextValue()) as string);
		commandText = commandText.replace(regexSQL, (await this.getCommandTextValue()) as string);
		commandText = commandText.replace(regexSQLArgument, (await this.getCommandTextValue()) as string);
		
		return commandText;
	}

	get description(): string {
		let currentValue: any = this.lastInput;
		if (currentValue === undefined) {
			currentValue = this.defaultValue;
		}
		return "Current: " + currentValue;
	}
}

