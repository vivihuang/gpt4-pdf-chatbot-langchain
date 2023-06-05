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

const getTemplates = () => [{
	title: '行情回顾',
	prompt: "\n现货数据为：" + `\n${mapArrToStr(spotsData)}` + "\n期货数据为：" + `\n${mapArrToStr(futuresData)}`,
}, {
	title: '需求状况',
	prompt: "\n成交量数据为：" + `\n${mapArrToStr(turnoverData)}`,
}, {
	title: '产量状况',
	prompt: "\n产量数据为：" + `\n${mapArrToStr(outputData)}` + "\n高炉数据为：" + `\n${mapArrToStr(productionData)}`,
}, {
	title: '库存状况',
	prompt: "\n库存数据为：" + `\n${mapArrToStr(stockData)}`,
}]

export const weeklyReportChain = async () => {
	try {
		const model = getModel()

		const templates = getTemplates()
		const result = await Promise.all(templates.map(async item => {
			const input = `今天是2023年5月12日，你是一个钢铁行业专家，请简短而专业的总结以下内容，回答采用markdown格式，需包含标题和分析两部分，` +
				`\n标题：${item.title}，${item.prompt}`
			console.log('Report input for ', item.title)
			return await model.call(input);
		}))
		return {
			text: result.join('\n')
		}
	} catch (e) {
		console.error('weekly report error', e)
		throw e
	}
};
