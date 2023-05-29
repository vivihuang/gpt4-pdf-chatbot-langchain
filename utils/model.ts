import { OpenAI } from 'langchain/llms/openai';

export const getModel = () => new OpenAI({
	temperature: 0, // increase temperature to get more creative answers
	modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
});
