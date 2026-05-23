import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadCSV = async (url: string): Promise<Document[]> => {
    const loader = new CSVLoader(url);

    const docs = await loader.load();
    return normalizeDocs(docs, url, 'csv');
}
