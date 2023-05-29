import { PromptTemplate } from "langchain/prompts";
import { getTools } from "@/utils/tools";
import { getModel } from "@/utils/model";

export const getBestTool = async (question: string) => {
	try {
		const model = getModel()
		const tools = getTools()

		const toolStrings = tools
			.map((tool) => `${tool.name}: ${tool.description}`)
			.join("\n");

		const prompt2 = new PromptTemplate({
			template:
				"你是一个钢铁行业的专家，请选择出最适合回答以下问题的工具并回答工具名称，如果找不到请回答none，你可以使用这些工具：\n" +
				toolStrings +
				"\n\n问题是: {question}" +
				"\n我选择的工具名称是: ",
			inputVariables: ["question"],
		});
		const input = await prompt2.format({ question });
		console.log('Get tool question: ', input)
		const result = await model.call(input);
		console.log('Get tool result: ', result)
		return result
	} catch (error: any) {
		console.log('error', error);
		throw error
	}
}
