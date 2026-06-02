import { Document } from "@langchain/core/documents";
import fs from "fs";
import os from "os";
import path from "path";
import PPTX2Json from "pptx2json";
import { normalizeDocs } from "../../../utils/docs_normalizer.util";

export const loadPPTX = async (file: File): Promise<Document[]> => {
  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.name}`);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    const parser = new PPTX2Json();
    const data = await parser.toJson(tempPath);  // ← toJson, not parse

    const text = data.slides
      ?.map((slide: any) =>
        slide.shapes
          ?.filter((shape: any) => shape.text)
          .map((shape: any) => shape.text)
          .join(" ")
      )
      .filter(Boolean)
      .join("\n");

    const doc = new Document({
      pageContent: text || "No text found in PPTX",
      metadata: {
        source: file.name,
        type: "pptx",
      },
    });

    return normalizeDocs([doc], file.name, "pptx");
  } catch (err) {
    console.error("PPTX parsing error:", err);
    throw new Error(`Failed to parse PPTX: ${err}`);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
};