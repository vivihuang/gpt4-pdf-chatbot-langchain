import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { DynamicTool } from "langchain/tools";

export enum Tools {
	QA_ECONOMY = 'qa_economic',
	QA_COMMODITY = 'qa_commodity',
	MARKET = 'market_data',
	CALCULATOR = 'calculator',
	SEARCH = 'search',

}

export const getTools = () => {
	if (!process.env.SERPAPI_API_KEY) {
		console.error('No SERPAPI_API_KEY available. Pls check.')
	}
	return [
		new Calculator(),
		new DynamicTool({
			name: Tools.QA_ECONOMY,
			description:
				"回答CPI，PPI，PMI等宏观经济问题",
			func: () => new Promise((resolve) => resolve(Tools.QA_ECONOMY)),
		}),
		new DynamicTool({
			name: Tools.QA_COMMODITY,
			description:
				"回答螺纹钢，铁矿石，热卷钢相关问题",
			func: () => new Promise((resolve) => resolve(Tools.QA_COMMODITY)),
		}),
		new DynamicTool({
			name: Tools.MARKET,
			description:
				"回答卡粉、PB粉矿、乌克兰精粉的价格问题",
			func: () => new Promise((resolve) => resolve(Tools.MARKET)),
		}),
		new SerpAPI(process.env.SERPAPI_API_KEY, {
			hl: "zh-cn",
			gl: "cn",
		}),
	];
}
