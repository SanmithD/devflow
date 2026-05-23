import { Document } from "@langchain/core/documents";
import fs from "fs/promises";

export const loadText = async (url: string): Promise<Document[]> => {
    const text = await fs.readFile(url, "utf-8");

    return [
        new Document({
            pageContent: text,
            metadata: { source: url, type: "text" }
        })
    ];
};