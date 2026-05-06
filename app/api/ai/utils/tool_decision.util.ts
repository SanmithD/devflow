import { createAgent } from "../chains/lang_agent.chains";
import { addSession, getSession } from "../memory/session.memory";
import { createTextStream } from "./text_stream.util";

export async function generateToolResponse(
    {
        session_id,
        userInput,
        abortSignal,
        tool
    }: {
        session_id: string;
        userInput: string;
        tool: any;
        abortSignal: AbortSignal
    }) {
    try {

        const history = getSession(session_id);
        const executor = await createAgent();
        if (!executor) return createTextStream("Failed to create agent executor");

        const result = await executor.invoke(
            { messages: [{ role: "user", content: userInput }] },
            { signal: abortSignal }
        );

        const lastMessage = result.messages[result.messages.length - 1];

        const resultText =
            typeof lastMessage?.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage?.content ?? result, null, 2);

        console.log("Tool result:", resultText.substring(0, 200));

        const toolResults = `\n[${tool}]: ${resultText}`;

        const toolMessage = `Tool (${tool}) returned:\n${resultText}`;

        addSession(session_id, { role: "assistant", content: toolMessage });

        history.push({ role: "assistant", content: toolMessage });

        return toolResults;
    } catch (error) {
        console.log('tool decision error', error);
        return createTextStream("");
    }
}