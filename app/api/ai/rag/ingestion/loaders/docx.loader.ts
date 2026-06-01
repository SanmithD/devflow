import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const officeParser = require("officeparser");

export const loadDocx = async (filePath: string, file: File): Promise<Document[]> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await officeParser.parseOfficeAsync(buffer, { fileType: "docx" });

    // result is either a string or an object with toText()
    const text = typeof result === "string" 
      ? result 
      : result?.toText?.() ?? result?.content?.map((c: any) => c.text).join("\n") ?? "";

    const doc = new Document({
      pageContent: text || "No text found in DOCX",
      metadata: { source: filePath, type: "docx" },
    });

    return normalizeDocs([doc], filePath, "docx");
  } catch (err) {
    console.error("DOCX parsing error:", err);
    throw new Error(`Failed to parse DOCX: ${err}`);
  }
};