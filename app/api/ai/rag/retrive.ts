import { createEmbedder } from "./embedding";
import { vectorStore } from "./vector_store";

export const retrive = async (
    query: string,
    session_id: string
) => {
    const queryEmbedding = (await createEmbedder(query)) as number[];

    const results = vectorStore.search(queryEmbedding, {
        topK: 5,
        projectId: Number(session_id),
        minScore: 0.6
    });

    return results.filter(r => r.score > 0.7); // return full objects more then 0.7 confidence
};