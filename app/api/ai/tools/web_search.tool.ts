import axios from "axios";
import { toolRegistry } from "./tool_registry.tool";

type SearchResult = {
    title?: string;
    snippet?: string;
    description?: string;
    url?: string;
    link?: string;
    source?: string;
}

toolRegistry.register({
    name: "web_search",
    description: "Use this tool to search the web for current information, general knowledge, specific facts, recent news, or unknown information not in context.",
    execute: async (input: string) => {
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
                return "No search results found.";
            }

            const data = response.data;

            console.log('raw data', data);

            const formatted = formatSearchResponse(data);

            console.log('formated data', formatted);

            return formatted || "Search completed but no results could be formatted.";

        } catch (error) {
            console.log("WebSearchTool error:", error);

            return {
                success: false,
                data: null
            };
        }
    }
});

function formatSearchResponse(data: any): string {
    let output = "";

    if (data.answer) {
        output += `${data.answer}\n\n`;
    } else if (data.ai_response) {
        output += `${data.ai_response}\n\n`;
    } else if (data.summary) {
        output += `${data.summary}\n\n`;
    }

    // Extract
    const results: SearchResult[] =
        data.results ||
        data.organic ||
        data.items ||
        data.web_results ||
        [];

    if (results && results.length > 0) {
        output += "## Sources\n\n";

        results.slice(0, 5).forEach((result: SearchResult, index: number) => {
            const title = result.title || 'Untitled';
            const snippet = result.snippet || result.description || '';
            const url = result.url || result.link || result.source || '';

            output += `### ${index + 1}. ${title}\n\n`;

            if (snippet) {
                output += `${snippet}\n\n`;
            }

            if (url) {
                output += `🔗 [Read more](${url})\n\n`;
            }

            output += "---\n\n";
        })
    }

    if (data.knowledge_graph) {
        const kg = data.knowledge_graph;
        output += "## Quick Facts\n\n";

        if (kg.title) output += `**${kg.title}**\n\n`;
        if (kg.description) output += `${kg.description}\n\n`;
        if (kg.url) output += `[Official Source](${kg.url})\n\n`;
    }

    return output.trim();
}