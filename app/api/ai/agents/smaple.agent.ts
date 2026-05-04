import { createAgent } from "../chains/lang_agent.chains";
import { generateAIResponse } from "../llm/openai.llm";
import { addSession, getSession } from "../memory/session.memory";
import { finalAnswerPrompt } from "../prompts/final_answer.prompt";
import { plannerPrompt } from "../prompts/planner.prompt";
import { synthesizerPrompt } from "../prompts/synthesizer.prompt";
import { retrive } from "../rag/retrive";
import "../tools";
import { AgentDecisionSchema } from "./schema.agent";

export const runAgent = async (
    userInput: string,
    session_id: string,
    abortSignal: AbortSignal
) => {
    try {
        const history = getSession(session_id);
        history.push({ role: "user", content: userInput });
        // Fetch context ONCE — reused by both planner and final answer
        const context = await retrive(userInput);
        let toolResults = "";
        for (let i = 0; i < 5; i++) {
            if (abortSignal.aborted) return createTextStream("Generation Stopped");
            console.log(`\n🔄 Agent iteration ${i + 1}`);
            // ── SYNTHESIZER: runs only after a tool has been called ──────────
            if (toolResults) {
                console.log("🧠 Synthesizing final answer from tool results...");
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
                let finalAnswer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    finalAnswer += decoder.decode(value, { stream: true });
                }
                addSession(session_id, { role: "assistant", content: finalAnswer });
                return createTextStream(finalAnswer, abortSignal);
            }
            // ── PLANNER: decides "final" or "tool" ──────────────────────────
            console.log("🗺️ Running planner...");
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
            let responseText = "";
            while (true) {
                const { done, value } = await plannerReader.read();
                if (done) break;
                responseText += plannerDecoder.decode(value, { stream: true });
            }
            console.log("🤖 Planner raw response:", responseText);
            // ── PARSE planner decision ───────────────────────────────────────
            let decision;
            try {
                const cleaned = responseText
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();
                const parsed = JSON.parse(cleaned);
                decision = AgentDecisionSchema.parse(parsed);
                console.log("📋 Decision:", decision);
            } catch (parseError) {
                console.error("❌ Failed to parse planner decision:", parseError);
                // Planner returned something unparseable — stream it as-is
                addSession(session_id, { role: "assistant", content: responseText });
                return createTextStream(responseText, abortSignal);
            }
            // ── FINAL: pass user query + context to the ReAct agent ─────────
            if (decision.action === "final") {
                if (abortSignal.aborted) return createTextStream("Generation stopped");
                console.log("✅ Decision is FINAL — invoking ReAct agent...");
                const executor = await createAgent();
                if (!executor) return createTextStream("Failed to create agent executor");
                // Build a rich prompt so the agent has context
                const agentInput = finalAnswerPrompt(context, userInput);
                // ^ update your finalAnswerPrompt to accept userInput too (see note below)
                const result = await executor.invoke(
                    { messages: [{ role: "user", content: agentInput }] },
                    { signal: abortSignal }
                );
                const lastMessage = result.messages[result.messages.length - 1];
                const finalAnswer =
                    typeof lastMessage?.content === "string"
                        ? lastMessage.content
                        : JSON.stringify(lastMessage?.content ?? result, null, 2);
                console.log("💬 Final answer from agent:", finalAnswer.substring(0, 200));
                addSession(session_id, { role: "assistant", content: finalAnswer });
                return createTextStream(finalAnswer, abortSignal);
            }
            // ── TOOL: delegate to ReAct agent with tool-use enabled ──────────
            if (decision.action === "tool") {
                if (abortSignal.aborted) return createTextStream("Generation stopped");
                // if (!decision.tool || !decision.input) {
                //     return createTextStream("Tool name or input missing");
                // }
                console.log(`🔧 Tool: ${decision.tool} | Input: ${decision.input}`);

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

                console.log("🔧 Tool result:", resultText.substring(0, 200));

                toolResults += `\n[${decision.tool}]: ${resultText}`;

                const toolMessage = `Tool (${decision.tool}) returned:\n${resultText}`;

                addSession(session_id, { role: "assistant", content: toolMessage });
                
                history.push({ role: "assistant", content: toolMessage });
                continue; // next iteration → synthesizer branch
            }
        }
        return createTextStream("Agent stopped at max iterations");
    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("agent error", error);
        return null;
    }
};
function createTextStream(text: string, abortSignal?: AbortSignal): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const chunkSize = 5;
            for (let i = 0; i < text.length; i += chunkSize) {
                if (abortSignal?.aborted) {
                    controller.close();
                    return;
                }
                controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
                await new Promise((resolve) => setTimeout(resolve, 10));
            }
            controller.close();
        },
    });
}