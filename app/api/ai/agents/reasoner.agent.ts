import { generateAIResponse } from "../llm/openai.llm";
import { getSession } from "../memory/session.memory";
import { retrive } from "../rag/retrive";

export const runReasoner = async ({
    userInput,
    session_id,
    abortSignal
}: {
    userInput: string;
    session_id: string;
    abortSignal: AbortSignal
}) => {
    try {

        // fetch context
        const context = await retrive(userInput);

        const history = getSession(session_id);

        const stream = await generateAIResponse({
            messages: [
                ...history,
                {
                    role: 'system',
                    content: `You are a reasoning assistant. Given the user query and context, 
restate the user's core intent in one clear sentence. 
Do not answer the question. Output ONLY the restated intent.

USER QUERY: ${userInput}
CONTEXT: ${context}`
                }
            ],
            abortSignal,
            toolChoice: 'none'
        });

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        let enrichedInput = "";

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            enrichedInput += decoder.decode(value, { stream: true })
        }

        console.log("🧠 Reasoner output:", enrichedInput);
        return { context, enrichedInput: enrichedInput || userInput };

    } catch (error) {
        console.log('server error', error);
        return null;
    }
}