import { ai } from "../config/ai.config";

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
}

export const generateAIResponse = async ({ messages }: { messages: ChatMessage[] }) => {
    try {
        const stram = await ai.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages,
            stream: true,
            temperature: 0.7,
            tool_choice: "none"
        });

        const encoder = new TextEncoder();

        return new ReadableStream({
            async start(controller){
                for await(const chunk of stram){
                    const content = chunk?.choices[0]?.delta?.content;

                    if(content){
                        controller.enqueue(encoder.encode(content))
                    }
                }
                controller.close();
            }
        });
    } catch (error) {
        console.log('agent error', error);
        throw new Error('Fail to generate response');
    }
}