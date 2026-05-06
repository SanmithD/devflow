import { DynamicTool } from "@langchain/core/tools";
import { evaluate } from "mathjs";

export const calculatorTool = new DynamicTool({
  name: "calculator",
  description: "Evaluates mathematical expressions and returns the result. Supports basic arithmetic (+, -, *, /), exponents (^), parentheses, and common math functions. Example inputs: '2 + 2', 'sqrt(16)', 'sin(pi/2)'",

  func: async (input: string): Promise<string> => {
    try {
      const result = evaluate(input);
      return `${input} = ${result}`;
    } catch (error) {
      console.error("Calculator tool error:", error);
      return `Invalid math expression: "${input}". Please provide a valid mathematical expression.`;
    }
  },
});