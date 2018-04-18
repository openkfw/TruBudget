import {
  MultichainClient,
  CreateStreamOptions,
  StreamTxId,
  Stream,
  StreamBody,
  StreamName,
  StreamItem,
  TxId
} from "./Client2.h";
import * as Liststreamkeyitems from "./responses/liststreamkeyitems";
import * as Liststreamitems from "./responses/liststreamitems";
import { RpcClient, ConnectionSettings } from "./RpcClient.h";
import { randomString } from "./hash";
import { objectToHex, hexToObject } from "./hexconverter";

// Oddly enough, there is no way to tell Multichain to return _everything_..
const maxItemCount: number = 0x7fffffff;

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

  private async createStream(options: CreateStreamOptions): Promise<void> {
    const streamName = options.name || randomStreamName();

    console.log(`:createStream options=${JSON.stringify(options)} => name=${streamName}`);

    const isPublic = true; // in multichain terms: isOpen
    const customFields = { kind: options.kind };

    const log = options.initialLogEntry ? [options.initialLogEntry] : [];

    // TODO(kevin): no error handling, see
    // https://github.com/openkfw/TruBudget/issues/46
    return this.rpcClient
      .invoke("create", "stream", streamName, isPublic, customFields)
      .then(() => this.updateStreamItem(streamName, "log", log))
      .then(() => this.updateStreamItem(streamName, "permissions", options.permissions || {}))
      .then(() => this.updateStreamItem(streamName, "data", options.metadata || {}))
      .then(() =>
        Promise.all(
          (options.extraLogEntries || []).map(entry =>
            this.updateStreamItem(entry.streamName, "_log", entry.entry)
          )
        )
      );
  }

  async getProject(projectId) {
    return {
      log: await this.latestValuesForKey(projectId, "log", "MAX"),
      permissions: await this.latestValuesForKey(projectId, "permissions"),
      data: await this.latestValuesForKey(projectId, "data")
    };
  }

  async getAllProjects() {
    const streamNames = (await this.streams()).filter(stream => stream.kind === "project");
    return Promise.all(streamNames.map(this.getProject));
  }

  private async streams(): Promise<Stream[]> {
    return (await this.rpcClient.invoke("liststreams")).map(stream => ({
      name: stream.name,
      kind: stream.details.kind
    }));
  }

  private async streamItems(streamName: StreamName): Promise<StreamItem[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient.invoke(
      "liststreamitems",
      streamName,
      false,
      maxItemCount
    );
    return items.map(item => ({
      key: item.keys[0],
      value: hexToObject(item.data)
    }));
  }

  async latestValuesForKey(
    streamName: StreamName,
    key: string,
    nValues: number | undefined | "MAX" = 1
  ): Promise<any[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient.invoke(
      "liststreamkeyitems",
      streamName,
      key,
      false,
      nValues
    );
    return items.map(x => hexToObject(x.data));
  }

  async updateStreamItem(
    streamName: StreamName,
    keys: string | string[],
    object: any
  ): Promise<void> {
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamName, keys, data);
  }
}
