import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadCSV = async (filePath: string, file: File): Promise<Document[]> => {
  try {
    const text = await file.text();

    if (!text.trim()) {
      console.warn(`CSV file ${file.name} is empty`);
    }

    const rows = text.split("\n").map(row => row.trim()).filter(Boolean);

    const docs = rows.map((row, i) => 
      new Document({
        pageContent: row,
        metadata: {
          source: filePath,
          row: i + 1,
          type: "csv",
        },
      })
    );

    console.log('doc', docs);

    return normalizeDocs(docs, filePath, "csv");
  } catch (err) {
    console.error("CSV parsing error:", err);
    throw new Error(`Failed to parse CSV: ${err}`);
  }
};