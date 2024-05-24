export class DocumentReferenceBase {
  protected _id: string;
  protected _reference: string;
  protected _fileName: string;
  protected _hash: string;
  protected _link: string;
  protected _type: "link" | "document";
  public _available?: boolean;

  // todo tidy up
  constructor(id: string, fileName: string, hash: string, type: "link" | "document") {
    this._id = id;
    this._fileName = fileName;
    this._hash = hash;
    this._type = type;
    if (type === "link") {
      this._link = fileName;
    }
  }

  public get id(): string {
    return this._id;
  }

  public get fileName(): string {
    return this._fileName;
  }

  public get hash(): string {
    return this._hash;
  }

  public get available(): boolean {
    return this.available;
  }

  public set available(value: boolean) {
    this._available = value;
  }

  public get type(): "link" | "document" {
    return this._type;
  }
}
