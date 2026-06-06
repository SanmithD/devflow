import { pineconeIndex } from "@/app/src/lib/pinecone";
import { randomUUID } from "crypto";
import { chunkText } from "./chunk";
import { createEmbedder } from "./embedding";

export const ingest = async (
    text: string,
    projectId?: number,
    filename?: string
) => {
    if (!text?.trim()) {
        throw new Error("Empty text");
    }

    const chunks = chunkText(text, 500, 100);

    console.log(
        `📄 Ingesting ${chunks.length} chunks for project ${projectId}`
    );

    const vectors = [];

    for (const chunk of chunks) {
        const embedding = await createEmbedder(chunk);

        vectors.push({
            id: randomUUID(),
            values: embedding as number[],
            metadata: {
                text: chunk,
                projectId: Number(projectId),
                source: filename ?? "",
            },
        });
    }

    await pineconeIndex.upsert({
        records: vectors,
    });

    console.log(`✅ Stored ${vectors.length} vectors`);
};