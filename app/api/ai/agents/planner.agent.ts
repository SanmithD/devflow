import { generateAIResponse } from "../llm/openai.llm";
import { getSession } from "../memory/session.memory";
import { plannerPrompt } from "../prompts/planner.prompt";
import { AgentDecision, AgentDecisionSchema } from "./schema.agent";

export const runPlanner = async (
    {
        userInput,
        context,
        session_id,
        abortSignal,
    }: {
        userInput: string;
        context: string;
        session_id: string;
        abortSignal: AbortSignal
    }
): Promise<AgentDecision | null> => {
    try {

        // get history
        const history = getSession(session_id);

        const stream = await generateAIResponse({
            messages: [
                ...history,
                {
                    role: 'system',
                    content: plannerPrompt(context, userInput)
                }
            ],
            abortSignal,
            toolChoice: 'none'
        });

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        let responseText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            responseText += decoder.decode(value, { stream: true });
        }

        console.log("🗺️ Planner raw response:", responseText);

        // clean the raw response
        const cleaned = responseText
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

        console.log('cleaned res', cleaned);

        const parsed = JSON.parse(cleaned);

        console.log('parsed res', parsed);
        return AgentDecisionSchema.parse(parsed);
    } catch (error) {
        console.error("❌ Planner failed:", error);
        return null;
    }
}