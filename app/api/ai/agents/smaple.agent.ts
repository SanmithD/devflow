import { generateAIResponse } from "../llm/openai.llm";
import { addSession, getSession } from "../memory/session.memory";
import { plannerPrompt } from "../prompts/planner.prompt";
import { retrive } from "../rag/retrive";
import { toolRegistry } from "../tools/tool_registry.tool";
import { AgentDecisionSchema } from "./schema.agent";

export const runAgent = async (userInput: string, session_id: string) => {
    try {
        const history = getSession(session_id);
        history.push({ role: "user", content: userInput });

        let toolUsed = false;

        for (let i = 0; i < 5; i++) {

            console.log(`\n🔄 Agent iteration ${i + 1}`);

            const context = await retrive(userInput);
            const planner_prompt = plannerPrompt(context);

            const responseStream = await generateAIResponse({
                messages: [
                    ...history,
                    { role: "system", content: planner_prompt + `\n\nContext:\n${context}` }
                ]
            });

            // Collect full response
            const reader = responseStream.getReader();
            const decoder = new TextDecoder();
            let responseText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                responseText += decoder.decode(value, { stream: true });
            }

            console.log("🤖 Agent response:", responseText);

            try {
                const parsed = JSON.parse(responseText);
                const decision = AgentDecisionSchema.parse(parsed);

                console.log("📋 Decision:", decision);

                if (decision.action === "final") {
                    const finalAnswer = decision.finalAnswer ?? "No final answer";
                    addSession(session_id, { role: "assistant", content: finalAnswer });

                    // ✅ Stream only the finalAnswer, not the JSON
                    return createTextStream(finalAnswer);
                }

                if (decision.action === "tool") {
                    if (!decision.tool || !decision.input) {
                        return createTextStream("Tool name or input is null");
                    }

                    console.log(`🔧 Using tool: ${decision.tool} with input: ${decision.input}`);

                    const tool = toolRegistry.get(decision.tool);
                    if (!tool) {
                        return createTextStream(`Tool ${decision.tool} not found`);
                    }

                    const result = await tool.execute(decision.input);
                    toolUsed = true;

                    const resultText = typeof result === 'string'
                        ? result
                        : JSON.stringify(result, null, 2);


                    console.log("✅ Tool result:", resultText.substring(0, 200) + "...");

                    const toolMessage = `Tool (${decision.tool}) returned:\n${resultText}`;

                    addSession(session_id, { role: "assistant", content: toolMessage });
                    history.push({ role: "assistant", content: toolMessage });

                    continue;
                }
            } catch (error) {
                console.error("Error parsing decision:", error);

                if (toolUsed) {
                    addSession(session_id, { role: "assistant", content: responseText });
                    return createTextStream(responseText);
                }

                // Return raw response as stream if JSON parsing fails
                addSession(session_id, { role: "assistant", content: responseText });
                return createTextStream(responseText);
            }
        }

        return createTextStream("Agent stopped at max iterations");
    } catch (error) {
        console.log('agent error', error);
        return null;
    }
}

// ✅ Stream text character by character for smooth streaming
function createTextStream(text: string): ReadableStream {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            // Stream character by character
            const chunkSize = 5;
            for (let i = 0; i < text.length; i += chunkSize) {
                const chunk = text.slice(i, i + chunkSize);
                controller.enqueue(encoder.encode(chunk));
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            controller.close();
        }
    });
}