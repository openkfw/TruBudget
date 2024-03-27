import * as crypto from 'crypto';

import {getItemByTx, getTxOutData, listStreamItems, listStreamKeyItems, listStreamKeys, listStreams} from '../rpc';
import {Item} from '../types/item';
import {StreamInfo} from '../types/stream';

const sodium = require("sodium-native");

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

const getStreamKeyItems = async (
  multichain: any,
  stream: string,
  key: string
): Promise<Item[] | undefined> => {
  try {
    return await listStreamKeyItems(multichain, stream, key);
  } catch (e) {
    console.log("error", e);
  }
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
    const {txid, vout} = item.data as any;
    return await getTxOutData(multichain, txid, vout);
  }
  throw new Error(`No document found for item ${item.txid}`);
};

const extractFileContentFromDocumentsOnChain = async (
  multichain: any,
  item: Item
): Promise<OnchainDocument | undefined> => {
  if (item.data.json === null) {
    return undefined
  }
  // Large offchain documents stored in offchain storage
  if (
    item.data &&
    item.data.hasOwnProperty("vout") &&
    item.data.hasOwnProperty("txid")
  ) {
    const data = await getFromTxOutData(multichain, item);
    if (data.json === null) {
      return undefined
    }
    if (data.json.document) {
      const {projectId, subprojectId, workflowitemId, document, type} =
        data.json;
      return {
        projectId,
        subprojectId,
        workflowitemId,
        fileMetadata: {
          ...document,
        },
        eventType: data.json.type
      };
    }
  }
  // small documents stored on chain

  const {projectId, subprojectId, workflowitemId, document} = item.data
    .json as any;
  return {
    projectId,
    subprojectId,
    workflowitemId,
    fileMetadata: {
      ...document,
    },
    eventType: item.data.json.type
  };
};
const decryptWithKey = (toDecrypt, privateKey): string => {
  const buffer = Buffer.from(toDecrypt, "base64");
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey.toString(),
      passphrase: "",
    },
    buffer
  );
  return decrypted.toString("utf8");
};

const decrypt = (
  organizationSecret: string,
  hexEncodedCiphertext: string
): string => {
  // The nonce/salt is prepended to the actual ciphertext:
  const dataBuffer = Buffer.from(hexEncodedCiphertext, "hex");
  const nonceBuffer = dataBuffer.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const cipherBuffer = dataBuffer.slice(sodium.crypto_secretbox_NONCEBYTES);

  const keyBuffer = toKeyBuffer(organizationSecret);

  const plaintextBuffer = Buffer.alloc(
    cipherBuffer.length - sodium.crypto_secretbox_MACBYTES
  );
  if (
    !sodium.crypto_secretbox_open_easy(
      plaintextBuffer,
      cipherBuffer,
      nonceBuffer,
      keyBuffer
    )
  ) {
    throw new Error("Decryption failed");
  }

  return plaintextBuffer.toString();
};

const toKeyBuffer = (secret: string): Buffer => {
  const key = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES);
  key.write(secret.slice(0, sodium.crypto_secretbox_KEYBYTES));

  return key;
};

export {
  decrypt,
  decryptWithKey,
  extractFileContentFromDocumentsOnChain,
  getAllStreamItems,
  getAllStreams,
  getFromTxOutData as getFromTxOutData,
  getStreamItemByTx,
  getStreamKeyItems,
  listStreamContent
};

