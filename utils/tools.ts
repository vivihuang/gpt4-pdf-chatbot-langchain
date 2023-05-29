import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { DynamicTool } from "langchain/tools";

export enum Tools {
	QA = 'qa_docs',
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
			name: Tools.QA,
			description:
				"回答宏观经济和黑色商品问题，如CPI, 螺纹钢价格等",
			func: () => new Promise((resolve) => resolve(Tools.QA)),
		}),
		new DynamicTool({
			name: Tools.MARKET,
			description:
				"回答矿粉市场价格问题，如卡粉、PB粉矿、乌克兰精粉",
			func: () => new Promise((resolve) => resolve(Tools.MARKET)),
		}),
		new SerpAPI(process.env.SERPAPI_API_KEY, {
			hl: "zh-cn",
			gl: "cn",
		}),
	];
}
