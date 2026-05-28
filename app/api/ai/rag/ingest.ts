import { randomUUID } from "crypto";
import { chunkText } from "./chunk";
import { createEmbedder } from "./embedding";
import { vectorStore } from "./vector_store";

export const ingest = async(text: string, projectId?: number, filename?: string) => {

    if (!text) throw new Error("Empty text");

    const chunks = chunkText(text, 500, 100);

    for(let i=0; i < chunks.length; i++){
        const chunk = chunks[i];

        const embedding = await createEmbedder(chunk) as number[];

        vectorStore.add({
            id: randomUUID(), // no collisions
            embedding,
            text: chunk,
            projectId: Number(projectId),
            source: filename
        })
    }
}