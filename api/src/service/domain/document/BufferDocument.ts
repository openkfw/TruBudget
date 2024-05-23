import { DocumentBase } from "./DocumentBase";

export class BufferDocument extends DocumentBase {
  constructor(id: string, fileName: string, content: Buffer) {
    super(id, fileName, content, "buffer");
  }

  public get content(): Buffer {
    return this._content as Buffer;
  }
}
