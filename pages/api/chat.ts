import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'langchain/llms/openai';
import { getBestTool } from "@/agents/toolAgent";
import { Tools } from "@/utils/tools";
import { customPDFChain } from "@/chains/customPDFChain";
import { customJsonChain } from "@/chains/customJsonChain";

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
		const { tool, toolInput } = await getBestTool(sanitizedQuestion)

		if (tool == Tools.QA) {
			const result = await customPDFChain(sanitizedQuestion)
			console.log('~~~~~~~~~~~~~~QA result', result.text)
			res.status(200).json(result);
		}
		if (tool == Tools.MARKET) {
			const result = await customJsonChain(sanitizedQuestion)
			console.log('~~~~~~~~~~~~~~Market result', result.text)
			res.status(200).json(result);
		}
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
	}
}
