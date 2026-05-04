import { createReactAgent } from '@langchain/langgraph/prebuilt'; // ✅ v1.x correct
import { ChatOpenAI } from '@langchain/openai';
import { Tools } from '../tools/tool_type.tool';

export const createAgent = async () => {
    try {
        const model = new ChatOpenAI({
            model: "openai/gpt-oss-20b",
            temperature: 0.7,
            apiKey: process.env.OPENAI_API_KEY,
            configuration: {
                baseURL: process.env.OPENAI_BASE_URL,
            },
        });

        // createReactAgent replaces createToolCallingAgent + AgentExecutor
        const agent = createReactAgent({
            llm: model,
            tools: Tools,
            prompt: "You are a helpful AI assistant. Use the available tools to answer questions accurately.",
        });

        return agent;

    } catch (error) {
        console.log('chain error', error);
        return null;
    }
}