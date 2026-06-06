import { pineconeIndex } from "@/app/src/lib/pinecone";
import { createEmbedder } from "./embedding";

export const retrive = async (
    query: string,
    session_id: string
) => {
    const queryEmbedding = await createEmbedder(query);

    const result = await pineconeIndex.query({
        vector: queryEmbedding as number[],
        topK: 5,
        includeMetadata: true,
        filter: {
            projectId: Number(session_id),
        },
    });

    return result.matches.map((match) => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text as string,
        projectId: match.metadata?.projectId as number,
        source: match.metadata?.source as string,
    }));
};