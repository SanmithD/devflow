import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

export const webSearchTool = new DynamicTool({
    name: "web_search",
    description: "Use this tool to search the web for current information, facts, recent news, or YouTube videos.",
    
    func: async (input: string): Promise<string> => {
        try {
            const response = await axios.get(
                `https://real-time-web-search.p.rapidapi.com/search`,  // ← use /search not /ai-mode
                {
                    params: {
                        q: input,
                        limit: 10
                    },
                    headers: {
                        "x-rapidapi-host": "real-time-web-search.p.rapidapi.com",
                        "x-rapidapi-key": process.env.RAPID_API_KEY!,
                    },
                    timeout: 10000
                }
            );

            if (!response.data?.data) {
                return "No search results found.";
            }

            // Return only real, verifiable results with actual URLs
            const results = response.data.data.map((item: any) => ({
                title: item.title,
                url: item.url,       // ← real crawled URLs
                snippet: item.snippet
            }));

            return JSON.stringify(results, null, 2);

        } catch (error) {
            console.error("WebSearchTool error:", error);
            if (axios.isAxiosError(error)) {
                return `Search failed: ${error.message}`;
            }
            return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
});