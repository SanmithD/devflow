import { Document } from "@langchain/core/documents";
import { parseOffice } from "officeparser";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadPPTX = async (filePath: string, file: File): Promise<Document[]> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const text = await new Promise<string>((resolve, reject) => {
      parseOffice(buffer, (err: any, data: string) => {
        if (err) return reject(err);
        resolve(data);
      });
    });

    const doc = new Document({
      pageContent: text || "No text found in PPTX",
      metadata: {
        source: filePath,
        type: "pptx",
      },
    });

    return normalizeDocs([doc], filePath, "pptx");
  } catch (err) {
    console.error("PPTX parsing error:", err);
    throw new Error(`Failed to parse PPTX: ${err}`);
  }
};