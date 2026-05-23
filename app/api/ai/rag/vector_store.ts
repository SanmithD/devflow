type VectorItem = {
    id: string;
    embedding: number[];
    text: string;
    projectId: number;
};

class VectorStore {
    private store: VectorItem[] = [];

    add(item: VectorItem) {
        this.store.push(item);
    }

    private cosine(a: number[], b: number[]) {
        let dot = 0;
        let magA = 0;
        let magB = 0;

        for (let i = 0; i < a.length; i++) {
            const ai = a[i] ?? 0;
            const bi = b[i] ?? 0;

            dot += ai * bi;
            magA += ai * ai;
            magB += bi * bi;
        }

        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    search(
        queryEmbedding: number[],
        options?: {
            topK?: number;
            projectId?: number;
            minScore?: number;
        }
    ) {
        const { topK = 5, projectId, minScore = 0 } = options || {};

        let results = this.store;

        // ✅ filter by project
        if (projectId !== undefined) {
            results = results.filter(item => item.projectId === projectId);
        }

        return results
            .map(item => {
                const score = this.cosine(queryEmbedding, item.embedding);

                return {
                    ...item,
                    score: (score + 1) / 2 // normalize 0 → 1
                };
            })
            .filter(item => item.score >= minScore) // remove weak matches
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }
}

export const vectorStore = new VectorStore();