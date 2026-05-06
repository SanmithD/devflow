import { createAgent } from "../chains/lang_agent.chains";
import { addSession } from "../memory/session.memory";
import { finalAnswerPrompt } from "../prompts/final_answer.prompt";
import { createTextStream } from "./text_stream.util";

export async function generateFinalResponse({ session_id, context, userInput, abortSignal }: { session_id: string; context: string; userInput: string; abortSignal: AbortSignal }) {
    try {
        console.log("Decision is FINAL — invoking ReAct agent...");

        const executor = await createAgent();
        if (!executor) return createTextStream("Failed to create agent executor");

        // Build a rich prompt so the agent has context
        const agentInput = finalAnswerPrompt(context, userInput);

        // ^ update your finalAnswerPrompt to accept userInput too (see note below)
        const result = await executor.invoke(
            { 
                messages: [{ 
                    role: "user", 
                    content: agentInput 
                }] 
            },
            { 
                signal: abortSignal 
            }
        );

        const lastMessage = result.messages[result.messages.length - 1];

        const finalAnswer =
            typeof lastMessage?.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage?.content ?? result, null, 2);

        console.log("Final answer from agent:", finalAnswer.substring(0, 200));

        addSession(
            session_id, 
            { role: "assistant", content: finalAnswer }
        );

        return createTextStream(finalAnswer, abortSignal);
    } catch (error) {
        console.log('final decision error', error);
        return createTextStream("");
    }
}