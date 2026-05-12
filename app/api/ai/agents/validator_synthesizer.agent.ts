import { generateAIResponse } from "../llm/openai.llm";
import { getSession } from "../memory/session.memory";

export const runValidatorSynthesizer = async (
    {
        toolResults,
        session_id,
        abortSignal
    }: {
        toolResults: string;
        session_id: string;
        abortSignal: AbortSignal
    }
): Promise<string | null> => {
    try {
        const trimed = toolResults.trim();

        if (!trimed || trimed.toLocaleLowerCase().includes("execution failed")) {
            console.warn("⚠️ Validator: tool result invalid, skipping synthesis");
            return null;
        }

        // get history
        const history = getSession(session_id);

        // Synthesizer
        const stream = await generateAIResponse({
            messages: [
                ...history,
                {
                    role: 'system',
                    content: `You are a helpful assistant. Based on the tool results below, 
write a clear final answer in markdown. Do NOT call any tools. Do NOT output JSON.

TOOL RESULTS:
${toolResults}`,
                }
            ],
            abortSignal,
            toolChoice: 'none'
        });

        const reader = stream.getReader();
        const decoder = new TextDecoder();

        let result = "";
        while(true){
            const { done, value } = await reader.read();

            if(done) break;

            result += decoder.decode(value, { stream: true });
        }

        return result || null;

    } catch (error) {
        console.log('server error', error);
        return null;
    }
}