export class DocumentBase {
  protected _id: string;
  protected _fileName: string;
  protected _content: string | Buffer;

  constructor(id: string, fileName: string, content: string | Buffer) {
    this._id = id;
    this._fileName = fileName;
    this._content = content;
  }

  public get id(): string {
    return this._id;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get content(): string | Buffer {
    return this._content;
  }

  public getHash(): string {
    throw new Error("You have to implement the method getHash");
  }
}
