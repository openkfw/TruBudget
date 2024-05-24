import { DocumentBase } from "./DocumentBase";
import { DocumentReferenceBase } from "./DocumentReferenceBase";

export class LinkDocument extends DocumentBase {
  constructor(id: string, fileName: string, content: string) {
    super(id, fileName, content, "link");
  }

  public get content(): string {
    return this._content as string;
  }

  public getHash(): string {
    throw new Error("Not implemented");
  }

  public reference(): DocumentReferenceBase {
    return new DocumentReferenceBase(this._id, this._fileName, this._content as string, "link");
  }
}
