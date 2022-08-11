import mapLimit from "async/mapLimit";
import * as crypto from "crypto";
import {
  downloadFileFromApi,
  getApiInstanceForUser,
  getWorkflowItemDetails,
  grantAllPermissionsOnWorkflowItem,
  uploadViaApi,
  WorkflowItemDetailsDocument,
} from "../helper/apiHelper";
import {
  extractFileContentFromDocumentsOnChain,
  getStreamItemByTx,
} from "../helper/migrationHelper";
import {
  MigrateFunction,
  MigrationCompleted,
  MigrationStatus,
  MoveFunction,
  VerifyParams,
} from "../migrate";
import ApplicationConfiguration from "../helper/config";

const MAX_ASYNC_OPERATIONS = 3;

const hashBase64 = (base64String: string): Promise<string> => {
  return new Promise<string>((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
};

export const documentUploader: MigrateFunction = {
  stream: "offchain_documents",
  function: async (params: MoveFunction): Promise<MigrationCompleted> => {
    const { sourceChain, item } = params;
    try {
      if (!item.available)
        return {
          status: MigrationStatus.Failed,
        };
      const document = await extractFileContentFromDocumentsOnChain(
        sourceChain,
        item
      );
      if (!document || document.eventType !== "workflowitem_document_uploaded")
        return {
          status: MigrationStatus.Failed,
        };

      //TODO: what do we do with storage_service_url_published events?
      const { projectId, subprojectId, workflowitemId, fileMetadata } =
        document;

      const migrationUserApi = await getApiInstanceForUser(
        ApplicationConfiguration.MIGRATION_USER_USERNAME,
        ApplicationConfiguration.MIGRATION_USER_PASSWORD
      );

      const rootUserApi = await getApiInstanceForUser(
        "root",
        ApplicationConfiguration.ROOT_SECRET
      );

      await grantAllPermissionsOnWorkflowItem(
        rootUserApi,
        ApplicationConfiguration.MIGRATION_USER_USERNAME,
        projectId,
        subprojectId,
        workflowitemId
      );
      /*await grantAllRightsToUser(
                    rootUserApi,
                    ApplicationConfiguration.MIGRATION_USER_USERNAME
                  );*/
      await uploadViaApi(migrationUserApi, {
        projectId,
        subprojectId,
        workflowitemId,
        fileMetadata: {
          document: {
            ...fileMetadata,
          },
        },
      });

      //There is no need to save changes on destination chain since API is processing request.

      return {
        sourceChainTx: item.txid,
        destinationChainTx: "Uploaded via API.",
        status: MigrationStatus.Ok,
        additionalData: {
          projectId,
          subprojectId,
          workflowitemId,
        },
      };
    } catch (error) {
      throw Error(
        `Error while uploading file ${params.item.txid} via API with ${error.message}`
      );
    }
  },
  verifier: async (params: VerifyParams): Promise<boolean> => {
    const { sourceChain, stream, sourceChainTx, additionalData } = params;
    const sourceItem = await getStreamItemByTx(
      sourceChain,
      stream,
      sourceChainTx
    );
    const documentOnSourceChain = await extractFileContentFromDocumentsOnChain(
      sourceChain,
      sourceItem
    );
    const documentOnSourceChainHash = await hashBase64(
      documentOnSourceChain.fileMetadata.base64
    );

    const {
      projectId: destinationProjectId,
      subprojectId: destinationSubprojectId,
      workflowitemId: destinationWorkflowitemId,
    } = additionalData;

    const migrationUserApi = await getApiInstanceForUser(
      ApplicationConfiguration.MIGRATION_USER_USERNAME,
      ApplicationConfiguration.MIGRATION_USER_PASSWORD
    );

    const destinationWorkflowItem = await getWorkflowItemDetails(
      migrationUserApi,
      destinationProjectId,
      destinationSubprojectId,
      destinationWorkflowitemId
    );

    // We do not know the new id of the document since api defines id
    // Workaround: get workflow item & check all files with same name & hash
    const documentsToVerify = destinationWorkflowItem.documents.filter(
      (document: WorkflowItemDetailsDocument) => {
        return (
          document.fileName === documentOnSourceChain.fileMetadata.fileName &&
          document.hash === documentOnSourceChainHash
        );
      }
    );

    const destinationFilesAvailable = documentsToVerify.length > 0;

    const allDocumentsReachable = await mapLimit(
      documentsToVerify,
      MAX_ASYNC_OPERATIONS,
      async (document) => {
        const destinationFileIsReachable = await downloadFileFromApi(
          migrationUserApi,
          destinationProjectId,
          destinationSubprojectId,
          destinationWorkflowitemId,
          document.id
        );
        return destinationFileIsReachable.hash === document.hash;
      }
    );

    return (
      documentsToVerify.length === allDocumentsReachable.length &&
      destinationFilesAvailable &&
      allDocumentsReachable.every((e) => e === true)
    );
  },
};
