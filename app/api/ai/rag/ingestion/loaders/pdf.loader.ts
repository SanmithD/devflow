import { Document } from "@langchain/core/documents";
import "@napi-rs/canvas";
import * as fs from "fs";
import { createRequire } from "module";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

const require = createRequire(import.meta.url);

export const loadPDF = async (filePath: string): Promise<Document[]> => {
  const pdfParse = require("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);

  const doc = new Document({
    pageContent: parsed.text,
    metadata: { source: filePath, pages: parsed.numpages },
  });

  return normalizeDocs([doc], filePath, "pdf");
};