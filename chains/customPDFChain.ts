import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { Chroma } from "langchain/vectorstores/chroma";
import initEmbeddings from "@/utils/embeddings";
import { CHROMA_NAME_SPACE } from "@/config/chroma";
import { getModel } from "@/utils/model";
import { getTodayStr } from "@/utils/date";

const CONDENSE_PROMPT = `根据以下对话和输入问题，将输入问题改写为一个独立问题。

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const getQaPrompt = () => `你是一个钢铁行业专家，今天是${getTodayStr()}，根据下面已知信息，简洁和专业的来回答用户的问题。如果无法从中得到答案，请说 “根据已知信息无法回答该问题” 或 “没有提供足够的相关信息”，不允许在答案中添加编造成分，答案请使用中文并使用markdown格式。

{context}

Question: {question}
Helpful Answer:`;


// todo: should include in chain call
export const customPDFChain = async (question: string) => {
	console.log('Start Q&A from docs for question : ', question)
	const model = getModel()
	const embeddings = initEmbeddings()
	const vectorStore = new Chroma(embeddings, { numDimensions: 1536, collectionName: CHROMA_NAME_SPACE })

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
