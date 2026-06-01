import { Document } from "@langchain/core/documents";

export const loadText = async (file: File): Promise<Document[]> => {
  try {
    const text = await file.text();

    if (!text.trim()) {
      console.warn(`File ${file.name} is empty`);
    }

    return [
      new Document({
        pageContent: text || "Empty text file",
        metadata: {
          source: file.name,
          type: "text",
        },
      }),
    ];
  } catch (err) {
    console.error("Text parsing error:", err);
    throw new Error(`Failed to parse text file: ${err}`);
  }
};