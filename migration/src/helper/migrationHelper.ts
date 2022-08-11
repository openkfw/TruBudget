import {
  getItemByTx,
  getTxOutData,
  listStreamItems,
  listStreamKeyItems,
  listStreamKeys,
  listStreams,
} from "../rpc";
import { Item } from "../types/item";
import { StreamInfo } from "../types/stream";

export interface OnchainDocument {
  projectId: string;
  subprojectId: string;
  workflowitemId: string;
  fileMetadata: {
    id: string;
    base64: string;
    fileName: string;
  };

  eventType: string;
}

const getAllStreams = async (
  multichain: any
): Promise<StreamInfo[] | undefined> => {
  try {
    const s = await listStreams(multichain);
    return s.map((el: any) => {
      return {
        name: el.name,
        details: el.details,
      };
    });
  } catch (e) {
    console.log("error", e);
  }
};

const listStreamContent = async (multichain: any, stream: string) => {
  try {
    return await listStreamItems(multichain, stream);
  } catch (e) {
    console.log("error", e);
  }
};

const getAllStreamItems = async (
  multichain: any,
  stream: string
): Promise<Item[] | undefined> => {
  const allItems = new Array<Item>();
  const keys = await listStreamKeys(multichain, stream);
  for await (const key of keys) {
    const items = await listStreamKeyItems(multichain, stream, key.key);
    allItems.push(...items);
  }
  return allItems;
};

const getStreamItemByTx = async (
  multichain: any,
  stream: string,
  tx: string
): Promise<Item | undefined> => {
  try {
    return await getItemByTx(multichain, stream, tx);
  } catch (e) {
    console.log("error", e);
  }
};

const getFromTxOutData = async (multichain: any, item: Item) => {
  if (
    item.data &&
    item.data.hasOwnProperty("vout") &&
    item.data.hasOwnProperty("txid")
  ) {
    const { txid, vout } = item.data as any;
    return await getTxOutData(multichain, txid, vout);
  }
  throw new Error(`No document found for item ${item.txid}`);
};

export const extractFileContentFromDocumentsOnChain = async (
  multichain: any,
  item: Item
): Promise<OnchainDocument> => {
  // Large offchain documents stored in offchain storage
  if (
    item.data &&
    item.data.hasOwnProperty("vout") &&
    item.data.hasOwnProperty("txid")
  ) {
    const data = await getFromTxOutData(multichain, item);
    if (data.json.document) {
      const { projectId, subprojectId, workflowitemId, document, type } =
        data.json;
      return {
        projectId,
        subprojectId,
        workflowitemId,
        fileMetadata: {
          ...document,
        },
        eventType: type,
      };
    }
  }
  // small documents stored on chain
  const { projectId, subprojectId, workflowitemId, document } = item.data
    .json as any;
  return {
    projectId,
    subprojectId,
    workflowitemId,
    fileMetadata: {
      ...document,
    },
    eventType: item.data.json.type,
  };
};

export {
  getAllStreams,
  listStreamContent,
  getAllStreamItems,
  getStreamItemByTx,
  getFromTxOutData as getFromTxOutData,
};
