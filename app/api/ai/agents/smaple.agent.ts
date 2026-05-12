import { addSession, getSession } from "../memory/session.memory";
import "../tools";
import { createTextStream } from "../utils/text_stream.util";
import { runDirectResponse } from "./direct_response.agent";
import { runPlanner } from "./planner.agent";
import { runReasoner } from "./reasoner.agent";
import { runToolExecution } from "./tool_execution.agent.ts";
import { runValidatorSynthesizer } from "./validator_synthesizer.agent";

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
        const resonerRes = await runReasoner({
            userInput,
            session_id,
            abortSignal
        });

        if(!resonerRes) throw new Error('Fail to reason')

        let toolResults = "";

        for (let i = 0; i < 5; i++) {
            if (abortSignal.aborted) return createTextStream("Generation Stopped");

            console.log(`\n🔄 Agent iteration ${i + 1}`);

            const decision = await runPlanner({
                userInput: resonerRes?.enrichedInput,
                session_id,
                context: resonerRes?.context,
                abortSignal
            });

            if (!decision) throw new Error('Fail to create plan');

            // tool path
            if (decision.action === 'tool' && decision.tool) {
                const rawResult = await runToolExecution({
                    input: String(decision.input ?? resonerRes?.enrichedInput),
                    session_id,
                    tool: decision.tool,
                    abortSignal
                });

                // validator
                const synthesized = await runValidatorSynthesizer({
                    toolResults: toolResults + rawResult,
                    session_id,
                    abortSignal
                });

                if (synthesized) {
                    addSession(session_id, {
                        role: 'assistant',
                        content: synthesized
                    });

                    return createTextStream(synthesized, abortSignal);
                }

                toolResults += rawResult;
                continue;
            }

            // Direct answer path
            if (decision.action === 'final') {
                return await runDirectResponse({
                    session_id,
                    context: resonerRes?.context,
                    userInput: resonerRes?.enrichedInput,
                    abortSignal,
                });
            }
        }

        return createTextStream("Agent stopped at max iterations");

        //     // ── SYNTHESIZER: runs only after a tool has been called ──────────
        //     if (toolResults) {
        //         console.log("Synthesizing final answer from tool results...");



        //         const result = await synthesizerGenerator({
        //             toolResults,
        //             abortSignal,
        //             session_id
        //         });

        //         if (!result) {
        //             throw new Error("Planner failed");
        //         }

        //         const { reader, decoder } = result.data;

        //         let finalAnswer = "";
        //         while (true) {
        //             const { done, value } = await reader.read();
        //             if (done) break;
        //             finalAnswer += decoder.decode(value, { stream: true });
        //         }
        //         addSession(session_id, { role: "assistant", content: finalAnswer });
        //         return createTextStream(finalAnswer, abortSignal);
        //     }
        //     // ── PLANNER: decides "final" or "tool" ──────────────────────────
        //     console.log("🗺️ Running planner...");

        //     const result = await plannerTextGenerator({
        //         userInput,
        //         context,
        //         abortSignal,
        //         session_id
        //     });

        //     if (!result) {
        //         throw new Error("Planner failed");
        //     }

        //     const { plannerReader, plannerDecoder } = result.data;

        //     let responseText = "";
        //     while (true) {
        //         const { done, value } = await plannerReader.read();
        //         if (done) break;
        //         responseText += plannerDecoder.decode(value, { stream: true });
        //     }
        //     console.log("Planner raw response:", responseText);

        //     // ── PARSE planner decision ───────────────────────────────────────
        //     let decision;
        //     try {
        //         const cleaned = responseText
        //             .replace(/```json\n?/g, "")
        //             .replace(/```\n?/g, "")
        //             .trim();

        //         const parsed = JSON.parse(cleaned);

        //         decision = AgentDecisionSchema.parse(parsed);
        //         console.log("📋 Decision:", decision);

        //     } catch (parseError) {
        //         console.error("❌ Failed to parse planner decision:", parseError);
        //         // Planner returned something unparseable — stream it as-is
        //         addSession(session_id, { role: "assistant", content: responseText });
        //         return createTextStream(responseText, abortSignal);
        //     }

        //     // ── FINAL: pass user query + context to the ReAct agent ─────────
        //     if (decision.action === "final") {
        //         if (abortSignal.aborted) return createTextStream("Generation stopped");
        //         return await generateFinalResponse({
        //             session_id,
        //             context,
        //             userInput,
        //             abortSignal
        //         })
        //     }
        //     // ── TOOL: delegate to ReAct agent with tool-use enabled ──────────
        //     if (decision.action === "tool") {
        //         if (abortSignal.aborted) return createTextStream("Generation stopped");

        //         toolResults += await generateToolResponse({
        //             session_id,
        //             tool: decision.tool,
        //             userInput: String(decision.input),
        //             abortSignal
        //         });

        //         continue;
        //     }
        // }
        // return createTextStream("Agent stopped at max iterations");
    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("agent error", error);
        return null;
    }
};
