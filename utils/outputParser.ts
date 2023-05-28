import { AgentActionOutputParser, } from "langchain/agents";
import { AgentAction, AgentFinish, } from "langchain/schema";

export class CustomOutputParser extends AgentActionOutputParser {
	async parse(text: string): Promise<AgentAction | AgentFinish> {
		if (text.includes("Final Answer:")) {
			const parts = text.split("Final Answer:");
			const output = parts[parts.length - 1].trim();
			const finalAnswers = { output: output };
			return { log: text, returnValues: finalAnswers };
		}

		const match = /Action: ([\s\S]*?)(?:\nAction Input: ([\s\S]*?))?$/.exec(
			text
		);
		if (!match) {
			throw new Error(`Could not parse LLM output: ${text}`);
		}

		return {
			tool: match[1].trim(),
			toolInput: match[2].trim().replace(/^("+)(.*?)(\1)$/, "$2") ?? "",
			log: text,
		};
	}

	getFormatInstructions(): string {
		throw new Error("Not implemented");
	}
}
