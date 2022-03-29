import { Stream, StreamKey } from "domain/stream";
import { StreamItem } from "domain/streamItem";

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
  stream: string,
): Promise<StreamItem[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamItems(
      {
        stream,
        verbose: true,
        count: 1000,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const streamItem = (
  multichain: any,
  stream: string,
  tx: string,
): Promise<StreamItem> => {
  return new Promise((resolve, reject) => {
    multichain.getStreamItem(
      {
        stream,
        txid: tx,
        verbose: true,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const createStreamItem = (
  multichain: any,
  stream: string,
  key: any,
  item: any,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    multichain.publish(
      {
        stream,
        verbose: true,
        key,
        data: { json: item.data.json },
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const createStream = (
  multichain: any,
  type: string,
  name: string,
  details: any,
) => {
  return new Promise((resolve, reject) => {
    multichain.create(
      {
        type,
        name,
        open: true,
        details,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const listStreamKeys = (
  multichain: any,
  stream: string,
): Promise<StreamKey[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamKeys(
      {
        stream,
        count: 1000000,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const listStreamKeyItems = (
  multichain: any,
  stream: string,
  key: string,
): Promise<StreamItem[]> => {
  return new Promise((resolve, reject) => {
    multichain.listStreamKeyItems(
      {
        stream,
        key,
        count: 1000000,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};

export const getItemByTx = (
  multichain: any,
  stream: string,
  txid: string,
): Promise<StreamItem> => {
  return new Promise((resolve, reject) => {
    multichain.getStreamItem(
      {
        stream,
        txid,
      },
      (err: any, items: any) => {
        if (err) {
          reject(err);
        }
        resolve(items);
      },
    );
  });
};
