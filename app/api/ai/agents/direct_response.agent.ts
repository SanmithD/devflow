import { createAgent } from "../chains/lang_agent.chains";
import { addSession } from "../memory/session.memory";
import { finalAnswerPrompt } from "../prompts/final_answer.prompt";
import { createTextStream } from "../utils/text_stream.util";

export const runDirectResponse = async(
    {
    session_id,
    context,
    userInput,
    abortSignal,
}: {
    session_id: string;
    context: string;
    userInput: string;
    abortSignal: AbortSignal;
}
) => {
    try {
        
        console.log("Direct response path — invoking ReAct agent...");

        const executor = await createAgent();

        if(!executor) return createTextStream("Fail to create agent executor");

        const agentInput = finalAnswerPrompt(context, userInput);

        // invoke agent
        const result = await executor.invoke(
            { messages: [{ role: "user", content: agentInput }], },
            { signal: abortSignal }
        );

        // get last message
        const lastMessage = result.messages[result.messages.length -1];

        const finalAnswer = typeof lastMessage?.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage?.content ?? result, null, 2);

                console.log("Direct response answer:", finalAnswer.substring(0, 200));

        addSession(session_id, { role: "assistant", content: finalAnswer });

        // Stream only here — final response
        return createTextStream(finalAnswer, abortSignal);

    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("Direct response error:", error);
        return createTextStream("");
    }
}