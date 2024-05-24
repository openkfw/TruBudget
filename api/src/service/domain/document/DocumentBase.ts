import { DocumentReferenceBase } from "./DocumentReferenceBase";

export class DocumentBase {
  protected _id: string;
  protected _fileName: string;
  protected _content: string | Buffer;
  protected _type: string;

  constructor(id: string, fileName: string, content: string | Buffer, type: string) {
    this._id = id;
    this._fileName = fileName;
    this._content = content;
    this._type = type;
  }

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get content(): string | Buffer {
    return this._content;
  }

  public get type(): string {
    return this._type;
  }

  public hash(): string {
    throw new Error("You have to implement the method hash");
  }

  public reference(): DocumentReferenceBase {
    throw new Error("You have to implement the method reference");
  }
}
