import { Document } from "@langchain/core/documents";
// import * as pdf from 'pdf-parse';
import { normalizeDocs } from "../../../utils/docs_normalizer.util";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

export const loadPDF = async (filePath: string, file: File): Promise<Document[]> => {
  try {
    console.log("file in pdf", { name: file.name, size: file.size, type: file.type });

    const buffer = Buffer.from(await file.arrayBuffer());
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