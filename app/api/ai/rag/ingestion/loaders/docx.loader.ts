import { Document } from "@langchain/core/documents";
import mammoth from "mammoth";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadDocx = async (
  file: File
): Promise<Document[]> => {
  try {
    // File -> Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // extract text
    const result = await mammoth.extractRawText({ buffer });

    const text = result.value; // plain text

    console.log("DOCX text:", text);

    const doc = new Document({
      pageContent: text || "No text found in DOCX",
      metadata: {
        source: file.name,
        type: "docx",
      },
    });

    return normalizeDocs([doc], file.name, "docx");
  } catch (err) {
    console.error("DOCX parsing error:", err);
    throw new Error(`Failed to parse DOCX: ${err}`);
  }
};