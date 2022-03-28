//Base Item. Most items can inherit from here
export interface StreamItem {
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
  json: any | DataType1 | DataType2;
}

export interface DataType1 {
  address: string;
  privkey: string;
}

export interface DataType2 {
  type: string;
  source: string;
  publisher: string;
}
