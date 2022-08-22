import { AssertParams, assertStreamItem } from "../assert";
import { getFromTxOutData } from "../helper/migrationHelper";
import {
  MigrateFunction,
  MigrationCompleted,
  MigrationStatus,
  MoveFunction,
  VerifyParams,
} from "../migrate";
import { createStreamItem } from "../rpc";
import { DataJSON } from "../types/item";
interface updatedJSON extends DataJSON {
  update: {
    documents: [];
  };
}

interface createdJSON extends DataJSON {
  workflowitem: {
    documents: [];
  };
}
export const makeProjectUploader = (projectId: string): MigrateFunction => {
  return {
    stream: projectId,
    function: async (params: MoveFunction): Promise<MigrationCompleted> => {
      const { sourceChain, destinationChain, item, stream } = params;

      try {
        if (!item.available)
          return {
            status: MigrationStatus.Failed,
          };
        let itemToMigrate = item;
        const txId = item.txid;
        let status = MigrationStatus.Ok;

        if (
          item.data &&
          item.data.hasOwnProperty("vout") &&
          item.data.hasOwnProperty("txid")
        ) {
          itemToMigrate = await getFromTxOutData(sourceChain, item);
        }
        if (
          itemToMigrate.data.json.type === "workflowitem_updated" &&
          (itemToMigrate.data.json as unknown as updatedJSON).update
            .documents &&
          (itemToMigrate.data.json as unknown as updatedJSON).update.documents
            .length
        ) {
          const newJson = itemToMigrate.data.json as unknown as updatedJSON;
          newJson.update.documents = [];
          status = MigrationStatus.Skipped;
          itemToMigrate = {
            ...itemToMigrate,
            data: { ...itemToMigrate.data, json: newJson as DataJSON },
          };
        } else if (
          itemToMigrate.data.json.type === "workflowitem_created" &&
          (itemToMigrate.data.json as unknown as createdJSON).workflowitem
            .documents &&
          (itemToMigrate.data.json as unknown as createdJSON).workflowitem
            .documents.length
        ) {
          const newJson = itemToMigrate.data.json as unknown as createdJSON;
          newJson.workflowitem.documents = [];
          status = MigrationStatus.Skipped;
          itemToMigrate = {
            ...itemToMigrate,
            data: { ...itemToMigrate.data, json: newJson as DataJSON },
          };
        }
        const req = await createStreamItem(
          destinationChain,
          stream,
          item.keys,
          itemToMigrate
        );
        console.log(
          `Created key ${JSON.stringify(
            item.keys
          )} on destination chain with tx ${req}`
        );
        return {
          sourceChainTx: txId,
          destinationChainTx: req,
          status,
        };
      } catch (error) {
        console.log(error);
        throw Error(
          `Error while uploading file ${params.item.txid} via API with ${error.message}`
        );
      }
    },
    verifier: async (params: VerifyParams): Promise<boolean> => {
      const {
        sourceChain,
        destinationChain,
        stream,
        sourceChainTx,
        destinationChainTx,
        status,
      } = params;
      const assertion: AssertParams = {
        sourceChain,
        destinationChain,
        stream,
        sourceChainTx,
        destinationChainTx,
      };

      if (status === MigrationStatus.Skipped) {
        return true;
      }

      return await assertStreamItem(assertion);
    },
  };
};
