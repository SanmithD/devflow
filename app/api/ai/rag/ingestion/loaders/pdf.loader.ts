// import * as pdf from 'pdf-parse';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

console.log(pdfParse);
console.log(typeof pdfParse);

export const loadPDF = async (filePath: string, file: File) => {
  const blob = new Blob(
    [await file.arrayBuffer()],
    { type: "application/pdf" }
  );

  const loader = new PDFLoader(blob);

  const docs = await loader.load();

  console.log('docs', docs);

  return normalizeDocs(docs, filePath, "pdf");
};
