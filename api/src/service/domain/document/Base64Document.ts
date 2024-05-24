import crypto from "crypto";
import { DocumentBase } from "./DocumentBase";
import { DocumentReferenceBase } from "./DocumentReferenceBase";

export class Base64Document extends DocumentBase {
  constructor(id: string, fileName: string, content: string) {
    super(id, fileName, content, "base64");
  }

  public get content(): string {
    return this._content as string;
  }

  public getHash(): string {
    const hash = crypto.createHash("sha256");
    hash.update(this._content);
    return hash.digest("hex");
  }

  public reference(): DocumentReferenceBase {
    return new DocumentReferenceBase(this._id, this._fileName, this.getHash(), "document");
  }
}
