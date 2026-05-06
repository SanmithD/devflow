import { createEmbedder } from "./embedding";
import { vectorStore } from "./vector_store";

export const ingest = async(text: string) => {

    const chunks = text.match(/.{1,500}/g) || [];

    for(let i=0; i < chunks.length; i++){
        const chunk = chunks[i];

        const embedding = await createEmbedder(chunk) as number[];

        vectorStore.add({
            id: `chunk-${i}`,
            embedding,
            text: chunk
        })
    }
}