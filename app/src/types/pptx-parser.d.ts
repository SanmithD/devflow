declare module "pptx-parser" {
  export default class PptxParser {
    constructor(buffer: Buffer);
    parse(): Promise<any[]>;
  }
}