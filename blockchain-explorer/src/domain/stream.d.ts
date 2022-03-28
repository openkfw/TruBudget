export interface Stream {
  name: string;
  createtxid: string;
  streamref: string;
  restrict: Restrict;
  details: Details;
  subscribed: boolean;
  retrieve: boolean;
  indexes: Indexes;
  synchronized: boolean;
  items: number;
  confirmed: number;
  keys: number;
  publishers: number;
}

export interface Details {}

export interface Indexes {
  items: boolean;
  keys: boolean;
  publishers: boolean;
  itemsLocal: boolean;
  keysLocal: boolean;
  publishersLocal: boolean;
}

export interface Restrict {
  write: boolean;
  onchain: boolean;
  offchain: boolean;
}

export interface StreamInfo {
  name: string;
  details: { kind: any };
}

export interface StreamKey {
  key: string;
  items: number;
  confirmed: number;
}
