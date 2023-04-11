import { ContextLanguage, ExecutionContext } from "../../../databricksApi/_types";
import { Helper } from "../../../helpers/Helper";
import { DatabricksWidget } from './DatabricksWidget';


export class DatabricksTextWidget extends DatabricksWidget<string> {

	private static WidgetRegExPositional: RegExp = /dbutils\.widgets\.text\(["']{1}(?<name>.*?)["']{1}\s*,\s*["']{1}(?<default>.*?)["'](,\s*["']{1}(?<label>.*?)["'])?\)/gm;
	private static WidgetRegExNamed: RegExp = /dbutils\.widgets\.text\((.*\s*name\s*=\s*['"](?<name>.*?)['"]\s*)(.*\s*defaultValue\s*=\s*['"](?<default>.*?)['"]\s*)(.*\s*label\s*=\s*['"](?<label>.*?)['"]\s*)\)/gm;

	constructor(language: ContextLanguage, name: string, defaultValue?: string, label?: string) {
		super(language, "text", name, defaultValue, label);
	}

	static loadFromCommandText(commandText: string, language: ContextLanguage): DatabricksTextWidget[] {
		let widgets: DatabricksTextWidget[] = [];

		widgets = widgets.concat(this.parseRegEx(commandText, this.WidgetRegExPositional, language));
		widgets = widgets.concat(this.parseRegEx(commandText, this.WidgetRegExNamed, language));


		return widgets;
	}

	private static parseRegEx(commandText: string, regex: RegExp, language: ContextLanguage): DatabricksTextWidget[] {
		const matches = commandText.matchAll(regex);

		let widgets: DatabricksTextWidget[] = [];

		for (let match of matches) {
			let widget = new DatabricksTextWidget(language,
				match.groups["name"],
				match.groups["default"],
				match.groups["label"]
			);
			widgets.push(widget);
		}

		return widgets;
	}

	async promptForInput(): Promise<string> {
		let currentValue: string = this.lastInput as string;
		if (currentValue === undefined) {
			currentValue = this.defaultValue as string;
		}
		let input = await Helper.showInputBox(currentValue, this.label, true);

		if (input) {
			this.lastInput = input;
		}
		else {
			this.lastInput = currentValue;
		}
		return this.lastInput;
	}

	async getInput(executionContext?: ExecutionContext, force: boolean = false): Promise<string> {
		if (this.lastInput && !force) {
			return this.lastInput as string;
		}
		return this.promptForInput();
	}

	getCommandTextValue(): string {
		switch (this.language) {
			case "r":
			case "sql":
				return "'" + this.lastInput + "'";

			case "python":
			case "scala":
				return '"""' + this.lastInput + '"""';

			default:
				return '"' + this.lastInput + '"';
		}
	}
}

