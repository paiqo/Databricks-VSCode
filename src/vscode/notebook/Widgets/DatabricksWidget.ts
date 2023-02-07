
import { ContextLanguage, ExecutionContext } from "../../../databricksApi/_types";

export type WidgetType =
	"text"
	| "combobox"
	| "dropdown"
	| "multiselect"
	;

export abstract class DatabricksWidget<T = string | string[]> {
	language: ContextLanguage;
	type: WidgetType;
	name: string;
	defaultValue?: string;
	label?: string;
	

	lastInput: T;

	constructor(lannguage: ContextLanguage, type: WidgetType, name: string, defaultValue?: string, label?: string) {
		this.language = lannguage;
		this.type = type as WidgetType;
		this.name = name;
		this.defaultValue = defaultValue ?? "";
		this.label = label ?? this.name;
	}

	static loadFromCommandText(commandText: string, language: ContextLanguage): DatabricksWidget[] {
		throw new Error("Not implemented");
	};
	abstract promptForInput(context?: ExecutionContext): Promise<T>;

	abstract getInput(executionContext: ExecutionContext, force?: boolean): Promise<T>;

	abstract getCommandTextValue(): string;

	async replaceInCommandText(commandText: string): Promise<string> {
		let regex = new RegExp("dbutils\\.widgets\\.get\\s*\\([\"']{1}" + this.name + "[\"']\\)");
		
		return commandText.replace(regex, (await this.getCommandTextValue()) as string);
	}
}

