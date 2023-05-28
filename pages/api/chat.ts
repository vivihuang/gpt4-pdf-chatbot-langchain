import type { NextApiRequest, NextApiResponse } from 'next';
import { makeChain } from '@/utils/makeChain';

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
		const response = await makeChain(sanitizedQuestion, history);
		console.log('response', response);
		res.status(200).json(response);
	} catch (error: any) {
		console.log('error', error);
		res.status(500).json({ error: error.message || 'Something went wrong' });
	}
}
