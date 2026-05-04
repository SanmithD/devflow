import { ai } from "../config/ai.config";

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

export const generateAIResponse = async (
    {
        messages,
        abortSignal,
        toolChoice = "none"
    }: {
        messages: ChatMessage[];
        abortSignal?: AbortSignal
        toolChoice: "none" | "auto"
    }) => {
    try {

        const stream = await ai.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages,
            stream: true,
            temperature: 0.7,
        }, {
            signal: abortSignal
        });

        const encoder = new TextEncoder();

        return new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        if (abortSignal?.aborted) {
                            await stream.controller.abort();
                            controller.close();
                            return;
                        }
                        const content = chunk?.choices[0]?.delta?.content;

                        if (content) {
                            controller.enqueue(encoder.encode(content))
                        }
                    }
                    controller.close();

                } catch (error) {
                    if ((error as Error).name === "AbortError") {
                        controller.close(); // clean close, not an error
                        return;
                    }
                    controller.error(error);
                }
            },

            cancel() {
                stream.controller.abort();
            }
        });
    } catch (error) {
        if ((error as Error).name === "AbortError") {
            // Return an empty stream — caller aborted before the request even started
            return new ReadableStream({
                start(controller) { controller.close(); }
            });
        }
        console.log('agent error', error);
        throw new Error('Fail to generate response');
    }
}