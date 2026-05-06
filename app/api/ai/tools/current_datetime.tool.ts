import { DynamicTool } from "@langchain/core/tools";

export const currentDatetimeTool = new DynamicTool({
  name: "current_datetime",
  description: "Returns the current date and time. Optional input: 'iso' for ISO format, 'locale' for local format, or leave empty for both.",

  func: async (input: string = ""): Promise<string> => {
    try {
      const now = new Date();
      const format = input.toLowerCase().trim();
      
      if (format === "iso") return now.toISOString();
      if (format === "locale") return now.toLocaleString();
      
      return `${now.toISOString()} (${now.toLocaleString()})`;
    } catch (error) {
      console.error("DateTime tool error:", error);
      return "Unable to get current date and time";
    }
  },
});