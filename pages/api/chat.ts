import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'langchain/llms/openai';
import { AgentExecutor, ZeroShotAgent } from 'langchain/agents'
import { LLMChain } from 'langchain/chains'
import { getTools } from "@/utils/tools";
import { CustomOutputParser } from "@/utils/outputParser";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const model = new OpenAI({
		temperature: 0, // increase temepreature to get more creative answers
		modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
	});

	const { question, history } = req.body;

	console.log('question', question);

	//only accept post requests
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	if (!question) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	try {
		const prefix = `你是一个来自中国的AI助手，请用中文回答问题，你可以使用下列工具来进行回答:`;

		const suffix = `开始，记住必须使用中文回答。

Question: {input}
Thought:{agent_scratchpad}`;


		const createPromptArgs = {
			prefix,
			suffix,
			inputVariables: ["input", "agent_scratchpad"],
		};

		const tools = getTools()

		const prompt = ZeroShotAgent.createPrompt(tools, createPromptArgs);

		const llmChain = new LLMChain({ llm: model, prompt });
		const agent = new ZeroShotAgent({
			llmChain,
			allowedTools: tools.map(n => n.name),
			outputParser: new CustomOutputParser()
		});
		const agentExecutor = AgentExecutor.fromAgentAndTools({ agent, tools });
		console.log("Loaded agent.");

		const result = await agentExecutor.call({ input: sanitizedQuestion });

		console.log(`Got output: ${result.output}`);
		res.status(200).json(result);
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
	}
}
