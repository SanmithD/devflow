import { generateAIResponse } from "../llm/openai.llm";
import { getSession } from "../memory/session.memory";
import { plannerPrompt } from "../prompts/planner.prompt";
import { synthesizerPrompt } from "../prompts/synthesizer.prompt";

export async function plannerTextGenerator(
    {
        context,
        userInput,
        abortSignal,
        session_id
    }: {
        context: string;
        userInput: string;
        session_id: string;
        abortSignal: AbortSignal
    }
) {
    try {
        const history = getSession(session_id);

        const plannerStream = await generateAIResponse({
            messages: [
                ...history,
                {
                    role: "system",
                    content: plannerPrompt(context, userInput),
                },
            ],
            abortSignal,
            toolChoice: "none",
        });
        const plannerReader = plannerStream.getReader();
        const plannerDecoder = new TextDecoder();

        return {
            data: {
                plannerDecoder,
                plannerReader
            },
        }
    } catch (error) {
        console.log('tool decision error', error);
        return;
    }
}

export async function synthesizerGenerator(
    {
        toolResults,
        abortSignal,
        session_id
    }: {
        toolResults: string;
        session_id: string;
        abortSignal: AbortSignal
    }
) {
    try {
        const history = getSession(session_id);

        const synthesisStream = await generateAIResponse({
            messages: [
                ...history,
                {
                    role: "system",
                    content: synthesizerPrompt(toolResults),
                },
            ],
            abortSignal,
            toolChoice: "none",
        });
        const reader = synthesisStream.getReader();
        const decoder = new TextDecoder();

        return {
            data: {
                reader,
                decoder
            },
        }
    } catch (error) {
        console.log('tool decision error', error);
        return;
    }
}