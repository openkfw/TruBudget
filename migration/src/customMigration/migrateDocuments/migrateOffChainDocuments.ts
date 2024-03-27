import {
  decrypt,
  decryptWithKey,
  extractFileContentFromDocumentsOnChain,
  getStreamKeyItems,
} from "../../helper/migrationHelper";
import {MigrateFunction, MigrationCompleted, MigrationStatus, MoveFunction, VerifyParams,} from "../../migrate";
import {downloadFromStorageServiceWithoutDecryption} from "./downloadFromStorageService";
import {
  getApiInstanceForUser,
  grantAllPermissionsOnWorkflowItem,
  revokeAllPermissionsOnWorkflowItem,
  UploadMetadata,
  uploadViaApi
} from "../../helper/apiHelper";
import ApplicationConfiguration from '../../helper/config';
import {listStreamKeyItems} from "../../rpc";


export interface UploadedDocument {
  id: string;
  base64: string;
  fileName: string;
}


const upload = async (documentToUpload: UploadMetadata) => {
  const rootUserApi = await getApiInstanceForUser(
    "root",
    ApplicationConfiguration.ROOT_SECRET_DESTINATION)
  const migrationUserApi = await getApiInstanceForUser(
    ApplicationConfiguration.MIGRATION_USER_USERNAME,
    ApplicationConfiguration.MIGRATION_USER_PASSWORD
  );


  await grantAllPermissionsOnWorkflowItem(
    rootUserApi,
    ApplicationConfiguration.MIGRATION_USER_USERNAME,
    documentToUpload.projectId,
    documentToUpload.subprojectId,
    documentToUpload.workflowitemId
  );
  await uploadViaApi(migrationUserApi, documentToUpload);
  await revokeAllPermissionsOnWorkflowItem(
    rootUserApi,
    ApplicationConfiguration.MIGRATION_USER_USERNAME,
    documentToUpload.projectId,
    documentToUpload.subprojectId,
    documentToUpload.workflowitemId
  );
}

const getDocumentSecret = async (multichain: any, documentId: string) => {
  const items = await listStreamKeyItems(
    multichain,
    "offchain_documents",
    documentId
  )
  const secretItem = items.find((item) => item.data.json.type === "secret_published")
  if (secretItem === undefined) {
    throw Error("Secret not found for document with id: " + documentId);
  }
  const decryptedSecret = ((secretItem.data.json) as any).encryptedSecret

  const privKeyEncryptedData: any = await getStreamKeyItems(
    multichain,
    `org:${ApplicationConfiguration.ORGANIZATION}`,
    "privateKey"
  );
  const privKeyEncrypted: string = privKeyEncryptedData[0].data.json.privateKey;

  const privateKey = decrypt(
    ApplicationConfiguration.ORGANIZATION_VAULT_SECRET,
    privKeyEncrypted
  );

  return decryptWithKey(decryptedSecret, privateKey)
}

export const documentUploader: MigrateFunction = {
  stream: "offchain_documents",
  function: async (params: MoveFunction): Promise<MigrationCompleted> => {
    const {sourceChain, item} = params;

    try {
      if (!item.available)
        return {
          status: MigrationStatus.Failed,
        };

      const document = await extractFileContentFromDocumentsOnChain(
        sourceChain,
        item
      );
      if (document === undefined) {
        console.warn("Document can not be found on/off chain! TX for manual checking is: ",
          item.txid)
        return {
          status: MigrationStatus.Skipped,
        };
      }

      const documentToUpload: UploadMetadata = {
        projectId: document.projectId,
        subprojectId: document.subprojectId,
        workflowitemId: document.workflowitemId,
        documents: [],
      };


      //Handle documents which are stored on on-chain//off-chain storage
      if (document.eventType === "workflowitem_document_uploaded") {
        const {fileMetadata} = document;
        documentToUpload.documents.push({
          id: fileMetadata.id,
          base64: fileMetadata.base64,
          fileName: fileMetadata.fileName,
        })
      }
      //Handle documents which are already stored on storage service
      else if (document.eventType === "document_uploaded") {
        const {docId, fileName} = item.data.json as any;
        const docSecret = await getDocumentSecret(sourceChain, docId)

        // Download document from storage service but let it encrypted.
        const downloadedDocument = await downloadFromStorageServiceWithoutDecryption(docId, docSecret);
        documentToUpload.documents.push({
          id: docId,
          base64: downloadedDocument,
          fileName,
        })
      }
      await upload(documentToUpload);

      //There is no need to save changes on destination chain since API is processing request.
      return {
        sourceChainTx: item.txid,
        destinationChainTx: "Uploaded via API.",
        status: MigrationStatus.Ok,
        additionalData: {
          projectId: documentToUpload.projectId,
          subprojectId: documentToUpload.subprojectId,
          workflowitemId: documentToUpload.workflowitemId,
        },
      }


    } catch (error) {
      throw Error(
        `Error while uploading file ${params.item.txid} via API with ${error.message}`
      );
    }
  },
  verifier: async (params: VerifyParams): Promise<boolean> => {
    // can be ignored as API is processing request and if something goes wrong, API will throw an error during upload
    return true;
  }
};