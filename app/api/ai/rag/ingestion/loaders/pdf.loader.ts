import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadPDF = async(url: string): Promise<Document[]> => {
    const loader = new PDFLoader(url);

    const docs = await loader.load();

    return normalizeDocs(docs, url, 'pdf');
}
