import { DocumentBase } from "./DocumentBase";

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
}
