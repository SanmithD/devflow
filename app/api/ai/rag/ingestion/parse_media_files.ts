import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import { ingest } from "../ingest";
import { loadDocx } from "./loaders/docx.loader";
import { loadCSV } from "./loaders/excel.loader";
import { loadJSON } from "./loaders/json.load";
import { loadPDF } from "./loaders/pdf.loader";
import { loadPPTX } from "./loaders/pptx.load";
import { loadText } from "./loaders/text.load";

export const parseMediaFiles = async (
  localPath: string,
  format: string,
  projectId: number
) => {
  try {
    const fileType = (format || localPath.split(".").pop() || "").toLocaleLowerCase();

    let data: Document[] | undefined;

    switch (fileType) {
      case "pdf": data = await loadPDF(localPath); break;
      case "txt": data = await loadText(localPath); break;
      case "csv": data = await loadCSV(localPath); break;
      case "pptx": data = await loadPPTX(localPath); break;
      case "docx": data = await loadDocx(localPath); break;
      case "json": data = await loadJSON(localPath); break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!data) throw new Error("Parsing failed — loader returned nothing");

    for (const doc of data) {
      await ingest(doc.pageContent, projectId);
    }
  } catch (error) {
    throw new Error(`Failed to parse media file: ${error}`);
  } finally {
    // Clean up temp file after parsing
    if (fs.existsSync(localPath)) {
      fs.unlink(localPath, () => { });
    }
  }
}