import { SerpAPI } from "langchain/tools";
import { Calculator } from "langchain/tools/calculator";
import { DynamicTool } from "langchain/tools";
import { customPDFChain } from '@/utils/customPDFChain';

export const getTools = () => {
	if (!process.env.SERPAPI_API_KEY) {
		console.error('No SERPAPI_API_KEY available. Pls check.')
	}
	return [
		new Calculator(),
		new DynamicTool({
			name: "qa_docs",
			description:
				"回答宏观经济和黑色商品问题，如CPI, 螺纹钢价格等",
			func: customPDFChain,
		}),
		new SerpAPI(process.env.SERPAPI_API_KEY, {
			hl: "zh-cn",
			gl: "cn",
		}),
	];
}
