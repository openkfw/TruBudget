import { Stream, StreamKey } from "domain/stream";
import { StreamItem } from "domain/streamItem";
import { MultichainInformation } from "domain/multichainInformation";

export interface ConnectionSettings {
  host: string;
  port: number;
  user: string;
  rpcPassword: string;
}

// No type provides by the npm package
export type MultichainClient = any;
export class RpcClient {
  private multichain: MultichainClient;

  constructor(settings: ConnectionSettings) {
    console.debug("Setting up RpcClient");
    this.multichain = require("multichain-node")({
      port: settings.port ?? 8000,
      host: settings.host ?? "127.0.0.1",
      user: settings.user ?? "multichainrpc",
      pass:
        settings.rpcPassword ?? "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j",
    });
  }

  /**
   * @returns Multichain information object
   */
  public async getInfo(): Promise<MultichainInformation> {
    return new Promise((resolve, reject) => {
      this.multichain.getInfo((err: any, info: MultichainInformation) => {
        if (err) {
          reject(err);
        }
        resolve(info);
      });
    });
  }

  /**
   * @returns all streams from Multichain
   */
  public listStreams(): Promise<Stream[]> {
    return new Promise((resolve, reject) => {
      this.multichain.listStreams((err: any, streams: Stream[]) => {
        if (err) {
          reject(err);
        }
        resolve(streams);
      });
    });
  }

  /**
   * @returns metadata of a stream
   */
  public async getStreamKeys(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      return this.multichain.listStreamKeys(
        {
          // createtxid of the stream
          stream: id,
        },
        (err: any, streamKeys: any) => {
          if (err) {
            reject(err);
          }
          resolve(streamKeys);
        },
      );
    });
  }

  /**
   * @returns a single stream item (transaction)
   */
  public getStreamItem(stream: string, txid: string) {
    return new Promise((resolve, reject) => {
      this.multichain.getStreamItem(
        {
          stream: "users",
          txid,
        },
        (err: any, res: any) => {
          if (err) {
            reject(err);
          }
          resolve(res);
        },
      );
    });
  }

  /**
   * @returns all stream items (transactions) of a stream
   */
  public listStreamItems(streamId: string): Promise<StreamItem[]> {
    return new Promise((resolve, reject) => {
      this.multichain.listStreamItems(
        {
          stream: streamId,
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
  }
}

// export const listStreamItems = (
//   multichain: any,
//   stream: string,
// ): Promise<StreamItem[]> => {
//   return new Promise((resolve, reject) => {
//     multichain.listStreamItems(
//       {
//         stream,
//         verbose: true,
//         count: 1000,
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const streamItem = (
//   multichain: any,
//   stream: string,
//   tx: string,
// ): Promise<StreamItem> => {
//   return new Promise((resolve, reject) => {
//     multichain.getStreamItem(
//       {
//         stream,
//         txid: tx,
//         verbose: true,
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const createStreamItem = (
//   multichain: any,
//   stream: string,
//   key: any,
//   item: any,
// ): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     multichain.publish(
//       {
//         stream,
//         verbose: true,
//         key,
//         data: { json: item.data.json },
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const createStream = (
//   multichain: any,
//   type: string,
//   name: string,
//   details: any,
// ) => {
//   return new Promise((resolve, reject) => {
//     multichain.create(
//       {
//         type,
//         name,
//         open: true,
//         details,
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const listStreamKeys = (
//   multichain: any,
//   stream: string,
// ): Promise<StreamKey[]> => {
//   return new Promise((resolve, reject) => {
//     multichain.listStreamKeys(
//       {
//         stream,
//         count: 1000000,
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const listStreamKeyItems = (
//   multichain: any,
//   stream: string,
//   key: string,
// ): Promise<StreamItem[]> => {
//   return new Promise((resolve, reject) => {
//     multichain.listStreamKeyItems(
//       {
//         stream,
//         key,
//         count: 1000000,
//       },
//       (err: any, items: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(items);
//       },
//     );
//   });
// };

// export const getItemByTxId = (
//   multichain: any,
//   stream: string,
//   txid: string,
// ): Promise<StreamItem> => {
//   return new Promise((resolve, reject) => {
//     multichain.getStreamItem(
//       {
//         stream,
//         txid,
//       },
//       (err: any, item: any) => {
//         if (err) {
//           reject(err);
//         }
//         resolve(item);
//       },
//     );
//   });
// };
