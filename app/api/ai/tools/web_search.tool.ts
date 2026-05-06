import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

export const webSearchTool = new DynamicTool({
    name: "web_search",
    description: "Use this tool to search the web for current information, general knowledge, specific facts, recent news, or unknown information not in context.",
    
    func: async (input: string): Promise<string> => {
        try {
            const response = await axios.get(
                `${process.env.RAPID_BASE_URL}/ai-mode?prompt=${encodeURIComponent(input)}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-rapidapi-host": "real-time-web-search.p.rapidapi.com",
                        "x-rapidapi-key": process.env.RAPID_API_KEY!,
                    },
                    timeout: 10000
                }
            );

            if (!response.data) {
                return "No search results found.";
            }

            return JSON.stringify(response.data, null, 2);

        } catch (error) {
            console.error("WebSearchTool error:", error);
            
            if (axios.isAxiosError(error)) {
                return `Search failed: ${error.message}`;
            }
            
            return `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
});