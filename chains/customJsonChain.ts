import { z } from "zod";
import { PromptTemplate } from "langchain/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { getModel } from "@/utils/model";
import marketData from '@/json/marketData.json'

const getTodayStr = () => new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', });

const getMarketDataByFilter = ({ dates, variety_names, ports, factory_areas }: Record<string, string[]>) => {
	let data = marketData
	if (dates && dates.length) {
		data = data.filter(d => dates.includes(d.market_date))
	}
	if (variety_names && variety_names.length) {
		data = data.filter(d => variety_names.includes(d.variety))
	}
	if (ports && ports.length) {
		data = data.filter(d => ports.includes(d.port))
	}
	if (factory_areas && factory_areas.length) {
		data = data.filter(d => factory_areas.includes(d.factory_area))
	}
	return (data.map(d => `日期: ${d.market_date} 名称: ${d.variety} 产地: ${d.factory_area} 港口: ${d.port} 价格: ${d.price}`)).join('\n')
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
		const prompt = new PromptTemplate({
			template:
				"Get data from user question to fill in the following JSON schema. If the user ask data for specific date, the answer for dates should be that day. If the use ask data for a period, the the answer for dates should include all dates for that period. The data format is yyyy-mm-dd. Must set today as {today}." +
				"\n{format_instructions}" +
				"\nThe question is: {question}",
			inputVariables: ["question", "today"],
			partialVariables: { format_instructions: formatInstructions },
		});

		const input = await prompt.format({ question, today: getTodayStr() });
		console.log(input)

		const response = await model.call(input);
		const parameters = await parser.parse(response)

		const result = getMarketDataByFilter(parameters)

		return { text: result }
	} catch (e) {
		console.error('json parse error', e)
		throw e
	}
};
