import crypto from "crypto";
import { DocumentBase } from "./DocumentBase";

export class Bse64Document extends DocumentBase {
  constructor(id: string, fileName: string, content: string) {
    super(id, fileName, content);
  }

  public get content(): string {
    return this._content as string;
  }

  public getHash(): string {
    const hash = crypto.createHash("sha256");
    hash.update(this._content);
    return hash.digest("hex");
  }
}
