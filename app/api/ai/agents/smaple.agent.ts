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

        // Fetch context ONCE — reused by both planner
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
   } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("agent error", error);
        return null;
    }
};
