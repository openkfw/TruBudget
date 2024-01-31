//Base Item. Most items can inherit from here
export interface Item {
  publishers: string[];
  keys: string[];
  offchain: boolean;
  available: boolean;
  data: Data;
  confirmations: number;
  blockhash: string;
  blockindex: number;
  blocktime: number;
  txid: string;
  vout: number;
  valid: boolean;
  time: number;
  timereceived: number;
}

export interface Data {
  json: DataJSON;
}

export interface DataJSON {
  type: string;
  source: string;
  publisher: string;
}

export interface SecretPublishedEvent extends DataJSON {
  type: "secret_published";
  docId: string;
  organization: string;
  encryptedSecret: string;
}
