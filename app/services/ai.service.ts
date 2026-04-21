import { ai } from "../src/lib/ai";

export const generateAIResponse = async (message: string) => {
    try {
        const response = await ai.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful backend debugging assistant.",
                },
                {
                    "role": "user",
                    "content": message
                }
            ]
        })

        return response.choices[0].message.content
    } catch (error) {
        console.log('agent error', error);
        throw new Error('Fail to generate response');
    }
}