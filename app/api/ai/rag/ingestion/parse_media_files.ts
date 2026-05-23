import { Document } from "@langchain/core/documents";
import { ingest } from "../ingest";
import { loadDocx } from "./loaders/docx.loader";
import { loadCSV } from "./loaders/excel.loader";
import { loadJSON } from "./loaders/json.load";
import { loadPDF } from "./loaders/pdf.loader";
import { loadPPTX } from "./loaders/pptx.load";
import { loadText } from "./loaders/text.load";
import { loadWeb } from "./loaders/web.loader";

export const parseMediaFiles = async (url: string, format: string, projectId: number) => {
    try {
        let data: Document[] | undefined;

        if (url.startsWith("http")) {
            data = await loadWeb(url);
        }
        const fileType = format || url.split(".").pop()?.toLowerCase();

        switch (fileType) {
            case "pdf":
                data = await loadPDF(url);
                break;
            case "txt":
                data = await loadText(url);
                break;
            case "csv":
                data = await loadCSV(url);
                break;
            case "pptx":
                data = await loadPPTX(url);
                break;
            case "docx":
                data = await loadDocx(url);
                break;
            case "json":
                data = await loadJSON(url);
                break;
            default:
                throw new Error("Unsupported file type");
        }

        if (!data) throw new Error("Parsing failed");

        for (const doc of data) {
            await ingest(doc.pageContent, projectId);
        }
    } catch (error) {
        throw new Error(`Unsupported file type: ${error}`);
    }
};