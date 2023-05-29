import { AgentExecutor, ZeroShotAgent } from 'langchain/agents'
import { LLMChain } from 'langchain/chains'
import { getTools } from "@/utils/tools";
import { getModel } from "@/utils/model";
import { CustomToolOutputParser } from "@/utils/customToolOutputParser";

export const getBestTool = async (input: string) => {
	try {
		const model = getModel()
		const tools = getTools()

		const prompt = ZeroShotAgent.createPrompt(tools);
		const llmChain = new LLMChain({ llm: model, prompt });
		const agent = new ZeroShotAgent({
			llmChain,
			allowedTools: tools.map(n => n.name),
			outputParser: new CustomToolOutputParser()
		});
		const agentExecutor = AgentExecutor.fromAgentAndTools({ agent, tools, maxIterations: 1 });
		console.log("Loaded agent.");

		const result = await agentExecutor.call({ input: input });

		console.log(`Got tool: ${result.tool}`);
		return result
	} catch (error: any) {
		console.log('error', error);
		throw error
	}
}
