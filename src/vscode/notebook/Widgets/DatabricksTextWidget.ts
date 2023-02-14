import { ContextLanguage, ExecutionContext } from "../../../databricksApi/_types";
import { Helper } from "../../../helpers/Helper";
import { DatabricksWidget } from './DatabricksWidget';


export class DatabricksTextWidget extends DatabricksWidget<string> {
	private static WidgetRegEx = /dbutils\.widgets\.text\s*\(["']{1}(?<name>.*?)["']{1}\s*,\s*["']{1}(?<defaultValue>.*?)["'](,\s*["']{1}(?<label>.*?)["'])?\)/gm;


	constructor(language: ContextLanguage, name: string, defaultValue?: string, label?: string) {
		super(language, "text", name, defaultValue, label);
	}

	static loadFromCommandText(commandText: string, language: ContextLanguage): DatabricksTextWidget[] {
		let matches = commandText.matchAll(DatabricksTextWidget.WidgetRegEx);

		let widgets: DatabricksTextWidget[] = [];
		for (let match of matches) {
			let widget = new DatabricksTextWidget(language, match.groups["name"], match.groups["defaultValue"], match.groups["label"]);
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

