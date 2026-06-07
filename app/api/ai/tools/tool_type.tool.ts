import { calculatorTool } from "./calculator.tool";
import { currentDatetimeTool } from "./current_datetime.tool";
import { exaSearch } from "./exa_search.tool";
import { gitHubSearch } from "./github_search.tool";
import { systemInfoTool } from "./system_info.tool";
import { tavilySearch } from "./tavily_search.tool";
import { userInfoTool } from "./user_data.tool";
import { weatherTool } from "./weather.tool";
import { webSearchTool } from "./web_search.tool";

export const Tools = [
    webSearchTool,
    calculatorTool,
    currentDatetimeTool,
    weatherTool,
    userInfoTool,
    systemInfoTool,
    tavilySearch,
    exaSearch,
    gitHubSearch
]