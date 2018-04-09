import { MultichainClient, CreateStreamOptions, StreamTxId, Stream, StreamBody } from "./Client.h";
import { RpcClient, ConnectionSettings } from "./RpcClient.h";
import { randomString } from "./hash";
import { objectToHex } from "./hexconverter";

const streamItemKeys: any = {
  metadata: "_metadata",
  log: "_log",
  permissions: "_permissions"
};

const randomStreamName = (): string => randomString(16);

export class RpcMultichainClient implements MultichainClient {
  private rpcClient: RpcClient;
  constructor(settings: ConnectionSettings) {
    this.rpcClient = new RpcClient(settings);
  }
  async createStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const streamName = options.name || randomStreamName();
    const isPublic = true;
    console.log(`:createStream options=${JSON.stringify(options)} => name=${streamName}`);
    const txId: StreamTxId = await this.rpcClient.invoke("create", "stream", streamName, isPublic, {
      kind: options.kind
    });
    if (options.initialLogEntry) {
      const key = "_log";
      const data = objectToHex(options.initialLogEntry);
      await this.rpcClient.invoke("publish", txId, key, data);
    }
    await Promise.all(
      (options.extraLogEntries || []).map(entry => {
        const key = "_log";
        const data = objectToHex(entry.entry);
        return this.rpcClient.invoke("publish", entry.streamName, key, data);
      })
    );
    return txId;
  }
  async streams(): Promise<Stream[]> {
    return (await this.rpcClient.invoke("liststreams")) as Stream[];
  }
  async streamBody(stream: Stream): Promise<StreamBody> {
    const body = await this.rpcClient.invoke("liststreamitems", stream.name || stream.createtxid);
    console.log(body);
    // TODO parse keys
    return {};
  }
}
