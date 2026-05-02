import axios from "axios";
import { toolRegistry } from "./tool_registry.tool";

toolRegistry.register({
    name: "web_search",
    description: "Use this tool to search the web for current information, general knowledge, specific facts, recent news, or unknown information not in context.",
    execute: async(input: string) => {
        try {
            const response = await axios.get(`${process.env.RAPID_BASE_URL}/ai-mode?prompt=${encodeURIComponent(input)}`,
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
                return { success: false, data: null };
            }

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.log("WebSearchTool error:", error);

            return {
                success: false,
                data: null
            };
        }
    }
})