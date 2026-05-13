import { addSession } from "../memory/session.memory";
import { Tools } from "../tools/tool_type.tool";

export const runToolExecution = async (
    {
        session_id,
        tool,
        input,
        abortSignal,
    }: {
        session_id: string;
        tool: string;
        input: string;
        abortSignal: AbortSignal;
    }
): Promise<string> => {
    try {

        console.log('input', input);
        console.log('tool', tool);
        console.log('is running inside tool exection')

        if(abortSignal.aborted) return 'Execution aborted';

        const selectedTool = Tools.find(t => t.name === tool);

        if(!selectedTool){
            return 'Tool not found'
        }

        console.log('selected tool', selectedTool);

        console.log(`🔧 Executing tool: ${tool} with input: ${input}`);
        const result = await selectedTool.invoke(input);

        const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

        console.log(`✅ Tool result (${tool}):`, resultText.substring(0, 200));

        addSession(session_id, {
            role: "assistant",
            content: `Tool (${tool}) returned:\n${resultText}`,
        });

        return `\n[${tool}]: ${resultText}`;
    } catch (error) {
        console.log('server error in tool execution', error);
        return 'fail to get tool data'
    }
}