import { Document } from "@langchain/core/documents";
import * as fs from "fs";
import * as https from "https";
import * as os from "os";
import * as path from "path";
import { ingest } from "../ingest";
import { loadDocx } from "./loaders/docx.loader";
import { loadCSV } from "./loaders/excel.loader";
import { loadJSON } from "./loaders/json.load";
import { loadPDF } from "./loaders/pdf.loader";
import { loadPPTX } from "./loaders/pptx.load";
import { loadText } from "./loaders/text.load";

// Downloads a remote URL to a temp file, returns the local path
const downloadToTemp = (url: string, ext: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tmpPath = path.join(os.tmpdir(), `upload_${Date.now()}.${ext}`);
    const file = fs.createWriteStream(tmpPath);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(tmpPath)));
    }).on("error", (err) => {
      fs.unlink(tmpPath, () => {}); // cleanup
      reject(err);
    });
  });
};

export const parseMediaFiles = async (
  url: string,
  format: string,
  projectId: number
) => {
  let tmpPath: string | null = null;

  try {
    const fileType = (format || url.split(".").pop() || "").toLowerCase();

    // Determine if we need to download it first
    const isRemote = url.startsWith("http://") || url.startsWith("https://");
    const localPath = isRemote
      ? await downloadToTemp(url, fileType)
      : url;

    tmpPath = isRemote ? localPath : null;

    let data: Document[] | undefined;

    switch (fileType) {
      case "pdf":
        data = await loadPDF(localPath);
        break;
      case "txt":
        data = await loadText(localPath);
        break;
      case "csv":
        data = await loadCSV(localPath);
        break;
      case "pptx":
        data = await loadPPTX(localPath);
        break;
      case "docx":
        data = await loadDocx(localPath);
        break;
      case "json":
        data = await loadJSON(localPath);
        break;
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
    // Always clean up the temp file
    if (tmpPath) {
      fs.unlink(tmpPath, () => {});
    }
  }
};