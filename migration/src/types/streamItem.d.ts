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
  json: JSON;
}

export interface JSON {
  address: string;
  privkey: string;
}
