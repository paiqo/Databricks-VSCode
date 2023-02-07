import * as vscode from 'vscode';
import { DatabricksApiService } from '../../../databricksApi/databricksApiService';

import { ContextLanguage, ExecutionContext } from "../../../databricksApi/_types";
import { DatabricksWidget, WidgetType } from './DatabricksWidget';


export class DatabricksSelectorWidget extends DatabricksWidget<string[]> {
	private static WidgetRegEx = /dbutils\.widgets\.(?<type>dropdown|combobox|multiselect)\(["']{1}(?<name>.*?)["']{1}\s*,\s*(?<defaultValue>["']{1}.*?["'])\s*,\s*(?<choices>.*?)(,\s*["']{1}(?<label>[^"']*)["'])?\)/gm;
	// a string representing how the choices can be calculated
	choicesRaw: string;
	// choicesRaw evaluated into an array of strings
	choices: string[];

	constructor(language: ContextLanguage, type: WidgetType, name: string, choicesRaw: string, defaultValue?: string, label?: string) {
		super(language, type, name, defaultValue, label);
		this.choicesRaw = choicesRaw;
	}

	static loadFromCommandText(commandText: string, language: ContextLanguage): DatabricksSelectorWidget[] {
		let matches = commandText.matchAll(DatabricksSelectorWidget.WidgetRegEx);

		let widgets: DatabricksSelectorWidget[] = [];
		for (let match of matches) {
			let widget = new DatabricksSelectorWidget(language, match.groups["type"] as WidgetType, match.groups["name"], match.groups["choices"], match.groups["defaultValue"], match.groups["label"]);
			widgets.push(widget);
		}

		return widgets;
	}

	async promptForInput(context: ExecutionContext): Promise<string[]> {
		let choices = await this.evaluateChoices(context);

		let currentValue: any = this.lastInput;
		if (currentValue === undefined) {
			currentValue = this.defaultValue;
		}

		let options: vscode.QuickPickOptions = { title: this.label, ignoreFocusOut: true, placeHolder: "Current: " + currentValue};

		let input: string[] = undefined;
		switch (this.type) {
			case "dropdown":
			case "combobox":
				options.canPickMany = false;
				input = [await vscode.window.showQuickPick(choices, options)];
				break;

			case "multiselect":
				options.canPickMany = true;
				input = await vscode.window.showQuickPick(choices, options) as unknown as string[];
				break;

			default:
				break;
		}

		if(input)
		{
			this.lastInput = input;
		}
		else
		{
			this.lastInput = currentValue;
		}
		return this.lastInput;
	}

	async evaluateChoices(executionContext: ExecutionContext): Promise<string[]> {
		let query: string = "";
		switch (this.language) {
			case "python":
				query = "display(sc.parallelize(" + this.choicesRaw + ").map(lambda x:(x,)).toDF())";
				break;
			case "scala":
				query = "display(spark.sparkContext.parallelize(" + this.choicesRaw + ").map(x => (x,)).toDF())";
				break;
			case "r":
				query = "display(data.frame(" + this.choicesRaw + ", stringsAsFactors = FALSE))";
				break;
			case "sql":
				query = "select * from (" + this.choicesRaw + ") as t";
				break;
			default:
				throw new Error("Language not supported");
		}
		let cmd = await DatabricksApiService.runCommand(executionContext, query, this.language);
		let result = await DatabricksApiService.getCommandResult(cmd, true);

		return result.results.data.map(x => x[0]);
	}

	async getInput(executionContext: ExecutionContext, force: boolean = false): Promise<string[]> {
		if (this.lastInput && !force) {
			return this.lastInput as string[];
		}
		return this.promptForInput(executionContext);
	}

	getCommandTextValue(): string {
		if (this.type == "multiselect") {
			switch (this.language) {
				case "r":
					return "c('" + this.lastInput.join('", "') + '")';
				case "sql":
					return "('" + this.lastInput.join("','") + "')";

				case "python":
					return "['" + this.lastInput.join("','") + "']";
				case "scala":
					return "Seq('" + this.lastInput.join('", "') + '")';

				default:
					return '"' + this.lastInput.join("','") + '"';
			}
		}
		else {
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
}