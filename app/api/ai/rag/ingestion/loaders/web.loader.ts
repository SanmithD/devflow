import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadWeb = async (url: string): Promise<Document[]> => {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    return normalizeDocs(docs, url, 'web');
};