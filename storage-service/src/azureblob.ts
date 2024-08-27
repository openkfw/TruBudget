import { BlobServiceClient } from "@azure/storage-blob";
import { v4 } from "uuid";
import config from "./config";
import { log } from "./index";
import { FileWithMeta, Metadata, sleep } from "./storage";

const containerName: string = config.azureBlobStorage.containerName;

async function streamToString(readableStream): Promise<string> {
  let data = "";
  for await (const chunk of readableStream) {
    data += chunk;
  }
  return data;
}

async function streamToBuffer(readableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

let blobServiceClient;
if (config.storageProvider === "azure-storage") {
  blobServiceClient = BlobServiceClient.fromConnectionString(
    config.azureBlobStorage.azureConnectionString || "",
  );
}

export const getAzureBlobStatus = async (): Promise<{
  status: number;
  statusText: string;
}> => {
  try {
    await blobServiceClient.listContainers();
  } catch (error) {
    log.error({ error }, "Error during health check on azure-storage");
    return {
      status: 504,
      statusText: "Not ready. Waiting forAzure blob storage server",
    };
  }
  return { status: 200, statusText: "Ready" };
};

export const createContainer = async (): Promise<void> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const createContainerResponse = await containerClient.createIfNotExists();
  log.info(
    `Create container ${containerName} successfully`,
    createContainerResponse.requestId,
  );
};

export const upload = async (
  file: string,
  content: string,
  metaData: Metadata,
): Promise<string> => {
  const secret = v4();
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const blockBlobClient = containerClient.getBlockBlobClient(file);
  const uploadBlobResponse = await blockBlobClient.upload(
    content,
    content.length,
  );
  const blobClient = containerClient.getBlobClient(file);
  await blobClient.setMetadata({ ...metaData, fileName: file, secret });
  log.trace(
    `Upload block blob ${file} successfully`,
    uploadBlobResponse.requestId,
  );
  return secret;
};

export const download = async (blobName: string): Promise<FileWithMeta> => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    log.trace(`Attempting to access container: ${containerName}`);

    const blobClient = containerClient.getBlobClient(blobName);
    log.trace(`Attempting to access blob: ${blobName}`);

    // Get blob content from position 0 to the end
    const downloadBlockBlobResponse = await blobClient.download();
    log.trace(
      `Blob download response status: ${downloadBlockBlobResponse._response.status}`,
    );

    const downloaded = (
      await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
    ).toString();

    const properties = await blobClient.getProperties();
    log.trace(`Blob properties: ${JSON.stringify(properties)}`);

    // Assuming FileWithMeta is a type that includes the downloaded content and metadata
    return {
      data: downloaded,
      meta: {
        name: blobName,
        "Content-Type": properties.contentType,
        fileName: properties.metadata?.fileName || "",
        docId: properties.metadata?.docId || "",
        secret: properties.metadata?.secret,
        comment: properties.metadata?.comment,
        lastModified: properties.lastModified,
      },
    };
  } catch (error) {
    log.error(`Error downloading blob: ${blobName}`, error);
    throw error;
  }
};

export const deleteDocument = async (blobName): Promise<void> => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  log.trace(await streamToString(downloadBlockBlobResponse.readableStreamBody));
  const blobDeleteResponse = blockBlobClient.delete();
  log.trace((await blobDeleteResponse).clientRequestId);
};

export const establishConnection = async (): Promise<void> => {
  const retries = 20;
  for (let i = 0; i <= retries; i++) {
    try {
      await createContainer();

      log.info("Connection with azure blob established.");
      break;
    } catch (err) {
      log.error(
        { err },
        "Problem with establishing connection to azure blob and creating bucket.",
      );

      if (i === retries) {
        log.error("Unable to connect with azure blob. EXITING!");
        process.exit(1);
      }
      await sleep(20000);
    }
  }
};
