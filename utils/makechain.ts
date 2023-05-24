import { OpenAI } from 'langchain/llms/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { Chroma } from "langchain/vectorstores/chroma";

const CONDENSE_PROMPT = `根据以下对话和输入问题，将输入问题改写为一个独立问题。

对话:
{chat_history}
输入问题: {question}
独立问题:`;

const QA_PROMPT = `你是一个来自中国的AI助手。根据下面已知信息，简洁和专业的来回答用户的问题。如果无法从中得到答案，请说 “根据已知信息无法回答该问题” 或 “没有提供足够的相关信息”，不允许在答案中添加编造成分，答案请使用中文并使用markdown格式。

{context}

问题: {question}
回答:`;

export const makeChain = (vectorstore: Chroma) => {
  const model = new OpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorstore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true, //The number of source documents returned is 4 by default
    },
  );
  return chain;
};
