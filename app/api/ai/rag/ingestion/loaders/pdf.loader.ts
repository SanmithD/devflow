import { Document } from "@langchain/core/documents";
import fs from "fs/promises";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadPDF = async (filePath: string): Promise<Document[]> => {
  try {
    const buffer = await fs.readFile(filePath);

    const pdfModule = await import("pdf-parse");
    const pdf = pdfModule.default;

    const pdfData = await pdf(buffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      console.warn(`PDF at ${filePath} contains no extractable text`);
    }

    const doc = new Document({
      pageContent: pdfData.text || "No text content found in PDF",
      metadata: {
        source: filePath,
        pages: pdfData.numpages,
        info: pdfData.info,
      },
    });

    return normalizeDocs([doc], filePath, "pdf");
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error(`Failed to parse PDF: ${error}`);
  }
};