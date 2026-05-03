import { createAgent } from "../chains/lang_agent.chains";
import { generateAIResponse } from "../llm/openai.llm";
import { addSession, getSession } from "../memory/session.memory";
import { plannerPrompt } from "../prompts/planner.prompt";
import { synthesizerPrompt } from "../prompts/synthesizer.prompt"; // 👈 new
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

        let toolResults = ""; // 👈 accumulate all tool results here

        for (let i = 0; i < 5; i++) {
            if (abortSignal.aborted) return createTextStream("Generation Stopped");

            console.log(`\n🔄 Agent iteration ${i + 1}`);

            const context = await retrive(userInput);

            // ── If we already have tool results, skip planning and synthesize ──
            if (toolResults) {
                console.log("🧠 Synthesizing final answer from tool results...");

                const synthesisStream = await generateAIResponse({
                    messages: [
                        ...history,
                        {
                            role: "system",
                            content: synthesizerPrompt(toolResults)
                        }
                    ],
                    abortSignal,
                    toolChoice: "none" // 👈 safe — synthesizer never needs tools
                });

                // Collect the synthesis
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

            // ── Planning phase — decide what to do ──────────────────────────
            const plannerStream = await generateAIResponse({
                messages: [
                    ...history,
                    {
                        role: "system",
                        content: plannerPrompt(context)
                    }
                ],
                abortSignal,
                toolChoice: "none" // 👈 planner also outputs raw JSON, not function calls
            });

            const reader = plannerStream.getReader();
            const decoder = new TextDecoder();
            let responseText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                responseText += decoder.decode(value, { stream: true });
            }

            console.log("🤖 Planner response:", responseText);

            try {
                // Strip markdown fences if model wraps JSON anyway
                const cleaned = responseText
                    .replace(/```json\n?/g, "")
                    .replace(/```\n?/g, "")
                    .trim();

                const parsed = JSON.parse(cleaned);
                const decision = AgentDecisionSchema.parse(parsed);

                console.log("📋 Decision:", decision);

                // ── Final answer directly from planner ───────────────────────
                if (decision.action === "final") {
                    if (abortSignal.aborted) return createTextStream("Generation stopped");
                    const finalAnswer = decision.finalAnswer ?? "No answer";
                    addSession(session_id, { role: "assistant", content: finalAnswer });
                    return createTextStream(finalAnswer, abortSignal);
                }

                // ── Tool call ────────────────────────────────────────────────
                if (decision.action === "tool") {
                    if (abortSignal.aborted) return createTextStream("Generation stopped");
                    if (!decision.tool || !decision.input) {
                        return createTextStream("Tool name or input missing");
                    }

                    console.log(`🔧 Tool: ${decision.tool} | Input: ${decision.input}`);

                    const executor = await createAgent();
                    if (!executor) return createTextStream("Failed to create agent executor");

                    const result = await executor.invoke(
                        { messages: [{ role: "user", content: decision.input }] },
                        { signal: abortSignal }
                    );

                    const lastMessage = result.messages[result.messages.length - 1];
                    const resultText = typeof lastMessage?.content === "string"
                        ? lastMessage.content
                        : JSON.stringify(lastMessage?.content ?? result, null, 2);

                    console.log("✅ Tool result:", resultText.substring(0, 200));

                    // 👇 Accumulate — next iteration goes to synthesizer
                    toolResults += `\n[${decision.tool}]: ${resultText}`;

                    const toolMessage = `Tool (${decision.tool}) returned:\n${resultText}`;
                    addSession(session_id, { role: "assistant", content: toolMessage });
                    history.push({ role: "assistant", content: toolMessage });

                    continue; // 👈 next iteration hits the synthesizer branch
                }

            } catch (error) {
                console.error("Parse error:", error);
                addSession(session_id, { role: "assistant", content: responseText });
                return createTextStream(responseText, abortSignal);
            }
        }

        return createTextStream("Agent stopped at max iterations");

    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.log("agent error", error);
        return null;
    }
};

function createTextStream(text: string, abortSignal?: AbortSignal): ReadableStream {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            const chunkSize = 5;
            for (let i = 0; i < text.length; i += chunkSize) {
                if (abortSignal?.aborted) { controller.close(); return; }
                controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            controller.close();
        }
    });
}