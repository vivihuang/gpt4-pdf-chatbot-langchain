import { PromptTemplate } from "langchain/prompts";
import productionData from '@/json/rebar/production.json'
import outputData from '@/json/rebar/output.json'
import futuresData from '@/json/rebar/futures.json'
import spotsData from '@/json/rebar/spots.json'
import turnoverData from '@/json/rebar/turnover.json'
import stockData from '@/json/rebar/stock.json'
import { getModel } from "@/utils/model";

const mapArrToStr = (data: Record<string, string | number>[]) => {
	const keys = Object.keys(data[0])
	return data.map((d) => keys.map(k => `${k}：${d[k]}`).join(' ')).join('\n')
}

const getPrompt = (d: string, suffix = '') => `请根据以下数据对本周螺纹钢${d}进行简短而专业的总结，${suffix}`

const getTemplates = () => [{
	title: '行情回顾',
	prompt: `${getPrompt("行情", "从现货和期货两个角度出发，")}` +
		"\n现货数据为：" + `\n${mapArrToStr(spotsData)}` +
		"\n期货数据为：" + `\n${mapArrToStr(futuresData)}`,
}, {
	title: '需求状况',
	prompt: `${getPrompt("成交量")}` +
		"\n成交量数据为：" + `\n${mapArrToStr(turnoverData)}`,
}, {
	title: '产量状况',
	prompt: `${getPrompt("产量", "从产量、高炉开工率、高炉产能利用率等角度出发，")}` +
		"\n产量数据为：" + `\n${mapArrToStr(outputData)}` +
		"\n高炉数据为：" + `\n${mapArrToStr(productionData)}`,
}, {
	title: '库存状况',
	prompt: `${getPrompt("库存")}` +
		"\n库存数据为：" + `\n${mapArrToStr(stockData)}`,
}]

export const weeklyReportChain = async () => {
	try {
		const model = getModel()

		const templates = getTemplates()
		const titles = templates.map(d => d.title).join('、')
		const templateStr = templates.map(d => `标题：${d.title}，数据和要求：${d.prompt}`).join('\n')
		const input = `今天是2023年5月12日，你是一个钢铁行业专家，请根据以下内容生成本周报告，报告采用markdown格式，应包含${titles}几部分，每部分控制在100字左右，每一部分的具体要求和数据分别为，` +
			`\n${templateStr}`
		const result = await model.call(input);
		return {
			text: result
		}
	} catch (e) {
		console.error('weekly report error', e)
		throw e
	}
};
