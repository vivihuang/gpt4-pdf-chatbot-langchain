import productionData from '@/json/rebar/production.json'
import outputData from '@/json/rebar/output.json'
import futuresData from '@/json/rebar/futures.json'
import spotsData from '@/json/rebar/spots.json'
import turnoverData from '@/json/rebar/turnover.json'
import areaStock from '@/json/rebar/areaStock.json'
import allStock from '@/json/rebar/allStock.json'
import { getModel } from "@/utils/model";
import { DEMAND_STATUS, MARKET_REVIEW, PRODUCTION_STATUS, STOCK_STATUS } from "@/config/reportTemplate";

const mapArrToStr = (data: Record<string, string | number | boolean>[]) => {
	const keys = Object.keys(data[0])
	return data.map((d) => keys.map(k => `${k}：${d[k]}`).join(' ')).join('\n')
}

const getTemplates = () => [{
	title: '行情回顾',
	prompt: "现货数据：" + mapArrToStr(spotsData) + "\n期货数据：" + `${mapArrToStr(futuresData)}`+ `\n模版：${MARKET_REVIEW}`,
}, {
	title: '需求状况',
	prompt: "成交量数据：" + mapArrToStr(turnoverData) + `\n模版：${DEMAND_STATUS}` ,
}, {
	title: '产量状况',
	prompt: "产量数据：" + mapArrToStr(outputData) + "\n高炉数据：" + mapArrToStr(productionData) + `\n模版：${PRODUCTION_STATUS}` ,
}, {
	title: '库存状况',
	prompt: "总库存数据：" + mapArrToStr(allStock) + "\n各区域库存数据：" + mapArrToStr(areaStock) + `\n模版：${STOCK_STATUS}`,
}]

export const weeklyReportChain = async () => {
	try {
		const model = getModel()

		const templates = getTemplates()
		const result = await Promise.all(templates.map(async item => {
			const input = `今天是2023年5月12日，周五，上周五是2023年5月5日，你是一个钢铁行业专家，请使用以下数据填入模版中合适的位置来生成本周的周报，回答采用markdown格式，需包含标题和填充后的模版两部分，` +
				`\n标题：${item.title}\n${item.prompt}`
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
