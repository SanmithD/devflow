import { evaluate } from "mathjs";
import { toolRegistry } from "./tool_registry.tool";

toolRegistry.register({
    name: 'calculator',
    description: 'Use this to calculate the math related queries',
    execute: async (input: string) => {
        try {
            const result = evaluate(input);
            return String(result);
        } catch (error) {
            console.log(error)
            return "Invalid expression";
        }
    }
});