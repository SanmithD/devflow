import { JSONLoader } from "@langchain/classic/document_loaders/fs/json";
import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadJSON = async(url: string): Promise<Document[]> => {
    const loader = new JSONLoader(url);

    const docs = await loader.load();
    return normalizeDocs(docs, url, 'json');
}
