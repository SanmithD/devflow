import { MediaMetadata } from "@/app/src/types/chat.type";
import { generateAIResponse } from "../llm/openai.llm";
import { getSession } from "../memory/session.memory";
import { retrive } from "../rag/retrive";

export const runReasoner = async ({
    userInput,
    session_id,
    abortSignal,
    media_metadata
}: {
    userInput: string;
    session_id: string;
    abortSignal: AbortSignal,
    media_metadata: MediaMetadata
}) => {
    try {

        // fetch context
        const chunks = await retrive(userInput, session_id);

        const fallbackContext = media_metadata && chunks.length === 0
            ? `A file named "${media_metadata.name}" (${media_metadata.format}) was uploaded for this session.`
            : "";

        const context = chunks.length > 0
            ? chunks.slice(0, 3).map(c => c.text).join("\n")
            : fallbackContext;

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