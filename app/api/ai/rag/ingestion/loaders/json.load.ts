import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadJSON = async (file: File): Promise<Document[]> => {
  try {
    // convert File -> text
    const text = await file.text();

    console.log('plain text', text);

    // parse JSON
    const jsonData = JSON.parse(text);

    // convert to Document[]
    const docs: Document[] = [
      new Document({
        pageContent: JSON.stringify(jsonData, null, 2),
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
        },
      }),
    ];

    console.log('docs_docs', docs);

    return normalizeDocs(docs, file.name, "json");
  } catch (error) {
    throw new Error(`Failed to parse JSON file: ${error}`);
  }
};