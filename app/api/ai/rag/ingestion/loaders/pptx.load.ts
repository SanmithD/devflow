import { Document } from "@langchain/core/documents";
import fs from "fs/promises";

export const loadPPTX = async (url: string): Promise<Document[]> => {
    const buffer = await fs.readFile(url);

    return [
        new Document({
            pageContent: buffer.toString("utf-8"), // not perfect but safe
            metadata: { source: url, type: "pptx" }
        })
    ];
};