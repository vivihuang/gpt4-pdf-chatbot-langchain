import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const initEmbeddings = () => {
	const batchSize = process.env.AZURE_OPENAI_API_KEY ? 1 : 512
	return new OpenAIEmbeddings({
		batchSize
	});
}

export default initEmbeddings
