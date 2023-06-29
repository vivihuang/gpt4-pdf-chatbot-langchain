import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { OpenSearchVectorStore } from "langchain/vectorstores/opensearch";
import initEmbeddings from "@/utils/embeddings";
import { VECTOR_DB_NAME_SPACE } from "@/config/vectorDB";
import { getModel } from "@/utils/model";
import { getTodayStr } from "@/utils/date";
import initOpenSearchClient from "@/utils/openSearchClient";

const CONDENSE_PROMPT = `根据以下对话和输入问题，将输入问题改写为一个独立问题。

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const getQaPrompt = () => `你是一个钢铁行业专家，今天是${getTodayStr()}，根据下面已知信息，简洁和专业的来回答用户的问题。答案请使用中文并使用markdown格式。

{context}

Question: {question}
Helpful Answer:`;


// todo: should include in chain call
export const customPDFChain = async (question: string) => {
	console.log('Start Q&A from docs for question : ', question)
	const model = getModel()
	const embeddings = initEmbeddings()
	const client = initOpenSearchClient()
	const vectorStore = new OpenSearchVectorStore(embeddings, { client, indexName: VECTOR_DB_NAME_SPACE })

	const results = await vectorStore.similaritySearch("当前热卷钢的库存和消费量分别是多少", 4);

	console.log(results)

	// const keywordInput = keywordPrompt + question
	// const keywords = await model.call(keywordInput);

	const chain = ConversationalRetrievalQAChain.fromLLM(
		model,
		vectorStore.asRetriever(),
		{
			qaTemplate: getQaPrompt(),
			questionGeneratorTemplate: CONDENSE_PROMPT,
			returnSourceDocuments: true, //The number of source documents returned is 4 by default
		},
	);
	return await chain.call({
		question: question,
		chat_history: [],
	});
};
