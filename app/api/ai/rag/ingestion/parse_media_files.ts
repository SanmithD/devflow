import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import { ingest } from "../ingest";
import { loadDocx } from "./loaders/docx.loader";
import { loadCSV } from "./loaders/excel.loader";
import { loadJSON } from "./loaders/json.load";
import { loadPDF } from "./loaders/pdf.loader";
import { loadPPTX } from "./loaders/pptx.load";
import { loadText } from "./loaders/text.load";

export const parseMediaFiles = async ({
  localPath,
  format,
  projectId,
  file_name,
  file,
}: {
  localPath: string;
  format: string;
  projectId?: number;
  file_name: string;
  file: File;
}) => {
  try {
    const fileType = (format || localPath.split(".").pop() || "").toLowerCase();

    console.log("file in parse", { name: file.name, size: file.size, type: file.type });

    let data: Document[] | undefined;

    switch (fileType) {
      case "pdf": data = await loadPDF(localPath, file); break;
      case "txt": data = await loadText(file); break;
      case "csv": data = await loadCSV(localPath, file); break;
      case "pptx": data = await loadPPTX(localPath, file); break;
      case "docx": data = await loadDocx(localPath, file); break;
      case "json": data = await loadJSON(localPath, file); break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    if (!data) throw new Error("Parsing failed — loader returned nothing");

    for (const doc of data) {
      await ingest(doc.pageContent, projectId, file_name);
    }
  } catch (error) {
    throw new Error(`Failed to parse media file: ${error}`);
  } finally {
    if (fs.existsSync(localPath)) {
      fs.unlink(localPath, () => { });
    }
  }
};