import { AgentActionOutputParser, } from "langchain/agents";
import { AgentAction, AgentFinish, } from "langchain/schema";

export class CustomToolOutputParser extends AgentActionOutputParser {
	async parse(text: string): Promise<AgentAction | AgentFinish> {
		console.log('~~~~~~~~~~~~~~~~~~~~~CustomToolOutputParser')
		console.log(text)

		const match = /Action: ([\s\S]*?)(?:\nAction Input: ([\s\S]*?))?$/.exec(
			text
		);
		if (!match) {
			throw new Error(`Could not parse LLM output: ${text}`);
		}

		return {
			log: text,
			returnValues: {
				tool: match[1].trim(),
				toolInput: match[2].trim().replace(/^("+)(.*?)(\1)$/, "$2") ?? "",
			}
		};
	}

	getFormatInstructions(): string {
		throw new Error("Not implemented");
	}
}
