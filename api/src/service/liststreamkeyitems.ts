/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Item {
  publishers: string[];
  keys: string[];
  data: any;
  confirmations: number;
  blocktime: number;
  txid: string;
}
