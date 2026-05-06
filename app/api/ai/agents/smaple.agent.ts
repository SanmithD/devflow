import { addSession, getSession } from "../memory/session.memory";
import { retrive } from "../rag/retrive";
import "../tools";
import { generateFinalResponse } from "../utils/final_decision.util";
import { plannerTextGenerator, synthesizerGenerator } from "../utils/planner_response.util";
import { createTextStream } from "../utils/text_stream.util";
import { generateToolResponse } from "../utils/tool_decision.util";
import { AgentDecisionSchema } from "./schema.agent";

export const runAgent = async (
    userInput: string,
    session_id: string,
    abortSignal: AbortSignal
) => {
    try {
        const history = getSession(session_id);
        console.log('history', history);

        history.push({ role: "user", content: userInput });
        
        // Fetch context ONCE — reused by both planner and final answer
        const context = await retrive(userInput);

        let toolResults = "";

        for (let i = 0; i < 5; i++) {
            if (abortSignal.aborted) return createTextStream("Generation Stopped");

            console.log(`\n🔄 Agent iteration ${i + 1}`);
            // ── SYNTHESIZER: runs only after a tool has been called ──────────
            if (toolResults) {
                console.log("Synthesizing final answer from tool results...");

                const result = await synthesizerGenerator({
                    toolResults,
                    abortSignal,
                    session_id
                });

                if (!result) {
                    throw new Error("Planner failed");
                }

                const { reader, decoder } = result.data;

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

            const result = await plannerTextGenerator({
                userInput,
                context,
                abortSignal,
                session_id
            });

            if (!result) {
                throw new Error("Planner failed");
            }

            const { plannerReader, plannerDecoder } = result.data;

            let responseText = "";
            while (true) {
                const { done, value } = await plannerReader.read();
                if (done) break;
                responseText += plannerDecoder.decode(value, { stream: true });
            }
            console.log("Planner raw response:", responseText);

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
                return await generateFinalResponse({
                    session_id,
                    context,
                    userInput,
                    abortSignal
                })
            }
            // ── TOOL: delegate to ReAct agent with tool-use enabled ──────────
            if (decision.action === "tool") {
                if (abortSignal.aborted) return createTextStream("Generation stopped");

                toolResults += await generateToolResponse({
                    session_id,
                    tool: decision.tool,
                    userInput,
                    abortSignal
                });

                continue;
            }
        }
        return createTextStream("Agent stopped at max iterations");
    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("agent error", error);
        return null;
    }
};
