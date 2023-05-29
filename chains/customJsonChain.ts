import { z } from "zod";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getModel } from "@/utils/model";
import marketData from '@/json/marketData.json'

const getTodayStr = () => {
	return 'May 9, 2023'
	// return new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', });
}

const getMarketDataByFilter = ({
	dates,
	variety_names,
	ports,
	factory_areas }: Record<string, string[]>): string[] | null => {
	let data = marketData
	if (dates?.length) {
		data = data.filter(d => dates.includes(d.market_date))
	}
	const allVarieties = marketData.map(d => d.variety)
	const availableVarieties = variety_names?.length ? variety_names.filter(d => allVarieties.includes(d)) : []
	if (availableVarieties?.length) {
		data = data.filter(d => availableVarieties.includes(d.variety))
	}
	const allPorts = marketData.map(d => d.port)
	const availablePorts = ports?.length ? ports.filter(d => allPorts.includes(d)) : []
	if (availablePorts?.length) {
		data = data.filter(d => availablePorts.includes(d.port))
	}
	const allAreas = marketData.map(d => d.factory_area)
	const availableAreas = factory_areas?.length ? factory_areas.filter(d => allAreas.includes(d)) : []
	if (availableAreas?.length) {
		data = data.filter(d => availableAreas.includes(d.factory_area))
	}
	return data && data.length ? data.map(d => `日期: ${d.market_date} 名称: ${d.variety} 产地: ${d.factory_area} 港口: ${d.port} 价格: ${d.price} 价差: ${d.change}`) : null
}

export const customJsonChain = async (question: string) => {
	try {
		const model = getModel()
		const parser = StructuredOutputParser.fromZodSchema(
			z
				.object({
					dates: z.array(z.string().regex(new RegExp('([12]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01]))'))),
					variety_names: z.array(z.string()),
					factory_areas: z.array(z.string()),
					ports: z.array(z.string()),
				})
				.required()
				.describe("Data to filter market data")
		);

		const formatInstructions = parser.getFormatInstructions()
		const prompt1 = new PromptTemplate({
			template:
				"Get data from user question to fill in the following JSON schema. If the user ask data for a specific date, the answer for dates should be that day. If the use ask data for a period, the the answer for dates should list all daily dates for that period. The data format is yyyy-mm-dd. Must set today as {today}." +
				"\n{format_instructions}" +
				"\nThe question is: {question}",
			inputVariables: ["question", "today"],
			partialVariables: { format_instructions: formatInstructions },
		});

		const input1 = await prompt1.format({ question, today: getTodayStr() });
		console.log('Get parameters: ', input1)

		const response = await model.call(input1);
		console.log('parameters response: ', response)
		const parameters = await parser.parse(response)

		const currentMarketData = getMarketDataByFilter(parameters)
		if (!currentMarketData) {
			return { text: "根据已知信息无法回答该问题" }
		}
		const prompt2 = new PromptTemplate({
			template:
				"假设今天是{today}, 根据以下信息，简洁和专业的来回答用户的问题" +
				"\n{context}" +
				"\nThe question is: {question}",
			inputVariables: ["question", "context", "today"],
		});
		const input2 = await prompt2.format({ question, today: getTodayStr(), context: currentMarketData });
		console.log('Get analysis: ', input2)
		const finalResult = await model.call(input2);
		console.log("finalResult", finalResult)
		return { text: finalResult }
	} catch (e) {
		console.error('json parse error', e)
		throw e
	}
};
