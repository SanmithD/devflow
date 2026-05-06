import { createEmbedder } from "./embedding";
import { vectorStore } from "./vector_store";

export const retrive = async(query: string) => {

    const queryEmbedding = await createEmbedder(query) as number[];
    
    const result = vectorStore.search(queryEmbedding, 3);

    return result.map(r => r.text).join("\n");
}