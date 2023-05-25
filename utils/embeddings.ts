import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const initEmbeddings = () => {
	return new OpenAIEmbeddings();
}

export default initEmbeddings
