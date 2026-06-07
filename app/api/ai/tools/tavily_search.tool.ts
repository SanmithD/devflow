import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

export const tavilySearch = new DynamicTool({
    name: 'tavily_search',
    description: 'Search the web for general, factual, and up-to-date information using Tavily AI search.',

    func: async (input: string): Promise<string> => {
        try {

            const response = await axios.post("https://api.tavily.com/search", {
                query: input,
                search_depth: "advanced",
                include_answer: true,
                include_raw_content: false,
                max_results: 5,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": process.env.TAVILY_SEARCH_API_KEY,
                },
                timeout: 20000
            });

            const data = response.data;

            const results = data.results?.map((item: any) => ({
                title: item.title,
                url: item.url,
                snippet: item.content,
            }));

            return JSON.stringify(
                {
                    answer: data.answer,
                    results
                },
                null,
                2
            )
        } catch (error) {
            console.log('Tavily error', error);
            return 'Tavily search failed';
        }
    }
})