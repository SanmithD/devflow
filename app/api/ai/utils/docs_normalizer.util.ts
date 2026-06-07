import { Document } from "@langchain/core/documents";

export const normalizeDocs = (docs: Document[], url: string, type: string) => {
   return docs.map(doc => new Document({
      pageContent: doc.pageContent,
      metadata: { ...doc.metadata, source: url, type }
   }));
};