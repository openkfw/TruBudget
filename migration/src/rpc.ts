import { Address } from "./types/address";
import { Item } from "./types/item";
import { Stream, StreamKey } from "./types/stream";
import { StreamItem } from "./types/streamItem";

export const info = (multichain: any) => {
  return multichain.getInfo((err: any, info: any) => {
    if (err) {
      throw err;
    }
    return info;
  });
};

export const listStreams = (multichain: any): Promise<Stream[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreams((err: any, stream: any) => {
      if (err) {
        reject(err);
      }
      resolve(stream);
    });
  });
};

export const listStreamItems = (
  multichain: any,
  stream: string
): Promise<StreamItem[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamItems(
      {
        stream,
        verbose: true,
        count: 1000,
      },

      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const streamItem = (
  multichain: any,
  stream: string,
  tx: string
): Promise<Item> => {
  return new Promise((resolve, reject) => {
    multichain.getStreamItem(
      {
        stream,
        txid: tx,
        verbose: true,
      },
      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const createStreamItem = (
  multichain: any,
  stream: string,
  key: string[],
  item: Item
): Promise<string> => {
  return new Promise((resolve, reject) => {
    multichain.publish(
      {
        stream,
        verbose: true,
        key,
        data: { json: item.data.json },
      },
      async (err: any, itmes: any) => {
        if (err) {
          return reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const createStream = async (
  multichain: any,
  type: string,
  name: string,
  details: any
) => {
  return new Promise((resolve, reject) => {
    multichain.create(
      {
        type,
        name,
        open: true,
        details,
      },
      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const listStreamKeys = (
  multichain: any,
  stream: string
): Promise<StreamKey[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamKeys(
      {
        stream,
        count: 1000000,
      },
      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const listStreamKeyItems = (
  multichain: any,
  stream: string,
  key: string
): Promise<Item[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamKeyItems(
      {
        stream,
        key,
        count: 1000000,
      },
      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};

export const getItemByTx = (
  multichain: any,
  stream: string,
  txid: string
): Promise<Item> => {
  return new Promise((resolve, reject) => {
    multichain.getStreamItem(
      {
        stream,
        txid,
      },
      (err: any, item: any) => {
        if (err) {
          reject(err);
        }
        resolve(item);
      }
    );
  });
};

export const getTxOutData = (
  multichain: any,
  txid: string,
  vout: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    multichain.getTxOutData(
      {
        txid,
        vout,
      },
      (err: any, itmes: any) => {
        if (err) {
          reject(err);
        }
        resolve(itmes);
      }
    );
  });
};
export const importPrivKey = (multichain: any, key: any) => {
  return new Promise((resolve, reject) => {
    multichain.importPrivKey(
      {
        privkey: key,
        rescan: true,
      },
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

export const dumpPrivKey = (
  multichain: any,
  address: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    multichain.dumpPrivKey(
      {
        address,
      },
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};

export const getAddresses = (multichain: any): Promise<Address[]> => {
  return new Promise((resolve, reject) => {
    multichain.getAddresses(
      {
        verbose: true,
      },
      (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      }
    );
  });
};
