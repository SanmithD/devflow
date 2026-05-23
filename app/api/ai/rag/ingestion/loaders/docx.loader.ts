import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadDocx = async(url: string): Promise<Document[]> => {
    const loader = new DocxLoader(url);

    const docs = await loader.load();
    return normalizeDocs(docs, url, 'docx');
}
