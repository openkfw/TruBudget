import axios from "axios";
import * as Minio from "minio";
import { v4 } from "uuid";
import config from "./config";
import { log } from "./index";
import * as Stream from "stream";
import { FileWithMeta, Metadata, MetadataWithName, sleep } from "./storage";

const region = process.env.MINIO_REGION || "us-east-1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const minioClient: Minio.Client = new Minio.Client({
  endPoint: config.storage.host,
  port: config.storage.port,
  useSSL: false,
  accessKey: config.storage.accessKey,
  secretKey: config.storage.secretKey,
});

export const getMinioStatus = async (): Promise<{
  status: number;
  statusText: string;
}> => {
  try {
    await axios.get(
      `http://${config.storage.host}:${config.storage.port}/minio/health/ready`,
    );
  } catch (error) {
    log.error({ error }, "Error during health check on minio-server");
    return { status: 504, statusText: "Not ready. Waiting for Minio server" };
  }
  return { status: 200, statusText: "Ready" };
};

const bucketName: string = config.storage.bucketName;

const makeBucket = async (bucket: string): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucket);

    if (!exists) {
      try {
        minioClient.makeBucket(bucket, region);

        log.info(`Minio: Bucket ${bucket} created.`);
      } catch (err) {
        log.error({ err }, "Error creating bucket.");
      }
    }
  } catch (err) {
    log.error({ err }, "Error during searching for bucket");
  }
};

const getSizeInBytes = (str: string): number => {
  const size = new Blob([str]).size;
  return size;
};

export const upload = async (
  file: string,
  content: string,
  metaData: Metadata,
): Promise<string> => {
  const readableStream: Stream.Readable = new Stream.Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readableStream._read = (): void => {};
  readableStream.push(content);
  readableStream.push(null);

  const secret = v4();
  const metaDataWithName: MetadataWithName = {
    ...metaData,
    secret,
    name: file,
  };
  // Using putObject API upload your file to the bucket.

  try {
    await minioClient.putObject(
      bucketName,
      file,
      readableStream,
      getSizeInBytes(content),
      metaDataWithName,
    );

    return secret;
  } catch (err) {
    log.error({ err }, "minioClient.putObject");
    throw err;
  }
};

const download = async (file: string, cb: Function): Promise<void> => {
  let fileContent = "";
  let meta: MetadataWithName;
  try {
    const dataStream = await minioClient.getObject(bucketName, file);

    log.trace("Fetching data from stream");
    dataStream.on("data", (chunk: string) => {
      fileContent += chunk;
    });
    dataStream.on("end", async () => {
      meta = await getMetadata(file);
      cb(null, { data: fileContent, meta });
    });
    dataStream.on("error", function (err) {
      log.error({ err }, "Error during getting file object data-stream");
    });
  } catch (err) {
    log.error({ err }, "Error during getting file object");
    throw err;
  }
};

export const downloadAsPromised = (file: string): Promise<FileWithMeta> => {
  return new Promise((resolve, reject) => {
    download(file, (err, fileContent: FileWithMeta) => {
      if (err) return reject(err);

      resolve(fileContent);
    });
  });
};

export const deleteDocument = async (file: string): Promise<void> => {
  return minioClient.removeObject(bucketName, file);
};

interface BucketItemStatWithMeta extends Minio.BucketItemStat {
  metaData: MetadataWithName;
}
export const getMetadata = async (
  fileHash: string,
): Promise<MetadataWithName> => {
  try {
    const stat = await minioClient.statObject(bucketName, fileHash);
    const { metaData } = stat as BucketItemStatWithMeta;

    return metaData;
  } catch (err) {
    log.error({ err }, "Error while getting Metadata");
    throw err;
  }
};

export const getReadiness = async (): Promise<void> => {
  try {
    await minioClient.listBuckets();
  } catch (err) {
    if (err) return log.error(err);
  }
};

export const establishConnection = async (): Promise<void> => {
  const retries = 20;
  for (let i = 0; i <= retries; i++) {
    try {
      await makeBucket(bucketName);

      log.info("Connection with min.io established.");
      break;
    } catch (err) {
      log.error(
        { err },
        "Problem with establishing connection to min.io and creating bucket.",
      );

      if (i === retries) {
        log.error("Unable to connect with min.io. EXITING!");
        process.exit(1);
      }
      await sleep(20000);
    }
  }
};

export default minioClient;
