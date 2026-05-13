import { calculatorTool } from "./calculator.tool";
import { currentDatetimeTool } from "./current_datetime.tool";
import { systemInfoTool } from "./system_info.tool";
import { userInfoTool } from "./user_data.tool";
import { weatherTool } from "./weather.tool";
import { webSearchTool } from "./web_search.tool";

export const Tools = [
    webSearchTool,
    calculatorTool,
    currentDatetimeTool,
    weatherTool,
    userInfoTool,
    systemInfoTool
]