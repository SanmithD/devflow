import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

export const exaSearch = new DynamicTool({
    name: "exa_search",
    description: "Search developer-focused content using semantic search (blogs, docs, technical articles).",

    func: async (input: string): Promise<string> => {
        try {

            const response = await axios.post("https://api.exa.ai/search", {
                query: input,
                numResults: 5,
                useAutoprompt: true,
                type: "auto",
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": process.env.EXA_SEARCH_API_KEY,
                },
                timeout: 20000
            });

            const results = response.data.results?.map((item: any) => ({
                title: item.title,
                url: item.url,
            }));

            return JSON.stringify(results || [], null, 2);
        } catch (error) {
            console.log('Tavily error', error);
            return 'Tavily search failed';
        }
    }
})