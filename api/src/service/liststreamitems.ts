export interface Item {
  publishers: string[];
  keys: string[];
  data: any;
  confirmations: number;
  blocktime: number;
  txid: string;
  v: number;
  offchain: boolean;
  available: boolean;
}
