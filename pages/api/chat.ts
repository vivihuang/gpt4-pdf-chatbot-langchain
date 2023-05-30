import type { NextApiRequest, NextApiResponse } from 'next';
import { getBestTool } from "@/agents/toolAgent";
import { Tools } from "@/utils/tools";
import { customPDFChain } from "@/chains/customPDFChain";
import { customJsonChain } from "@/chains/customJsonChain";
import { weeklyReportChain } from "@/chains/weeklyReportChain";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
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
		const tool = await getBestTool(sanitizedQuestion)

		if (tool == Tools.QA_ECONOMY || tool == Tools.QA_COMMODITY) {
			const result = await customPDFChain(sanitizedQuestion)
			console.log('~~~~~~~~~~~~~~QA result')
			console.log(result.text)
			res.status(200).json(result);
		} else if (tool == Tools.MARKET) {
			const result = await customJsonChain(sanitizedQuestion)
			console.log('~~~~~~~~~~~~~~Market result')
			console.log(result.text)
			res.status(200).json(result);
		} else if (tool == Tools.WEEKLY_REPORT) {
			const result = await weeklyReportChain()
			console.log('~~~~~~~~~~~~~~Weekly result')
			console.log(result.text)
			res.status(200).json(result);
		} else {
			res.status(200).json({ text: "暂无合适工具可回答该问题" });
		}
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
	}
}
