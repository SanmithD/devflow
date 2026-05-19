import { DynamicTool } from "@langchain/core/tools";
import axios from "axios";

export const gitHubSearch = new DynamicTool({
    name: "github_issue_search",
    description: "Search GitHub issues for real-world bugs, errors, git actions, git, github repository, pull requests and fixes.",

    func: async (input: string): Promise<string> => {
        try {

            const response = await axios.post("https://api.github.com/search/issues", {
                params: {
                    q: input,
                    sort: "reactions",
                    order: "desc",
                    per_page: 5,
                },
            }, {
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                },
                timeout: 20000
            });

            const results = response.data.items.map((item: any) => ({
                title: item.title,
                url: item.html_url,
                snippet: item.body?.slice(0, 200),
            }));

            return JSON.stringify(results, null, 2);
        } catch (error) {
            console.log('Tavily error', error);
            return 'Tavily search failed';
        }
    }
})