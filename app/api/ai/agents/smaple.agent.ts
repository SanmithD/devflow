import { MediaMetadata } from "@/app/src/types/chat.type";
import { addSession, getSession } from "../memory/session.memory";
import "../tools";
import { createAgentAuditLog } from "../utils/agent_audit.util";
import { createTextStream } from "../utils/text_stream.util";
import { runDirectResponse } from "./direct_response.agent";
import { runPlanner } from "./planner.agent";
import { runReasoner } from "./reasoner.agent";
import { runToolExecution } from "./tool_execution.agent.ts";
import { runValidatorSynthesizer } from "./validator_synthesizer.agent";

export const runAgent = async (
    userInput: string,
    session_id: string,
    abortSignal: AbortSignal,
    media_metadata: MediaMetadata
) => {
    try {
        const history = getSession(session_id);
        console.log('history', history);

        history.push({ role: "user", content: userInput });

        // Fetch context ONCE — reused by both planner
        const resonerRes = await runReasoner({
            userInput,
            session_id,
            abortSignal,
            media_metadata
        });

        if (!resonerRes) throw new Error('Fail to reason');

        await createAgentAuditLog({
            input: userInput,
            model: 'Reasoner',
            response: resonerRes?.enrichedInput
        });

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

            await createAgentAuditLog({
                input: decision.input || '',
                model: 'Planner',
                response: decision.action
            });

            // tool path
            if (decision.action === 'tool' && decision.tool) {

                const rawResult = await runToolExecution({
                    input: String(decision.input ?? resonerRes?.enrichedInput),
                    session_id,
                    tool: decision.tool,
                    abortSignal
                });

                await createAgentAuditLog({
                    input: String(decision.input ?? resonerRes?.enrichedInput),
                    model: 'Tool Executor',
                    response: rawResult
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

                    await createAgentAuditLog({
                        input: toolResults + rawResult,
                        model: 'Synthesizer',
                        response: synthesized
                    });

                    return createTextStream(synthesized, abortSignal);
                }

                toolResults += rawResult;
                continue;
            }

            // Direct answer path
            if (decision.action === 'final') {
                const res = await runDirectResponse({
                    session_id,
                    context: resonerRes?.context,
                    userInput: resonerRes?.enrichedInput,
                    abortSignal,
                });

                await createAgentAuditLog({
                    input: resonerRes?.enrichedInput,
                    model: 'Direct Response',
                    response: String(res)
                });

                return res;
            }
        }

        return createTextStream("Agent stopped at max iterations");
    } catch (error) {
        if ((error as Error).name === "AbortError") return createTextStream("");
        console.error("agent error", error);
        return null;
    }
};
