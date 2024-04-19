import axios from "axios";
import * as Minio from "minio";
import { v4 } from "uuid";
import config from "./config";
import { log } from "./index";
import * as Stream from "stream";
import {
  FileWithMeta,
  FullStat,
  Metadata,
  MetadataWithName,
  sleep,
} from "./storage";

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

const makeBucket = (bucket: string, cb: Function): void => {
  minioClient.bucketExists(bucket, (err: Error, exists: boolean) => {
    if (err) {
      log.error({ err }, "Error during searching for bucket");
      return cb(err);
    }

    if (!exists) {
      minioClient.makeBucket(bucket, "us-east-1", (err) => {
        if (err) {
          log.error({ err }, "Error creating bucket.");
          return cb(err);
        }
        log.info(`Minio: Bucket ${bucket} created.`);
        return cb(null, true);
      });
    }
    return cb(null, true);
  });
};

export const makeBucketAsPromised = (bucket: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    makeBucket(bucket, (err) => {
      if (err) return reject(err);

      resolve(true);
    });
  });
};

const getSizeInBytes = (str: string): number => {
  const size = new Blob([str]).size;
  return size;
};

const upload = (
  file: string,
  content: string,
  metaData: Metadata,
  cb: Function,
): void => {
  const readableStream: Stream.Readable = new Stream.Readable();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readableStream._read = (): void => {};
  readableStream.push(content);
  readableStream.push(null);

  const metaDataWithName: MetadataWithName = { ...metaData, name: file };
  // Using putObject API upload your file to the bucket.
  minioClient.putObject(
    bucketName,
    file,
    readableStream,
    getSizeInBytes(content),
    metaDataWithName,
    (err: Error) => {
      if (err) {
        log.error({ err }, "minioClient.putObject");
        return cb(err);
      }

      return cb(null);
    },
  );
};

/**
 *
 * @param file
 * @param content
 * @param metaData
 * @returns {string} document secret
 */
export const uploadAsPromised = (
  file: string,
  content: string,
  metaData: Metadata = { fileName: "default", docId: "123" },
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const secret = v4();
    upload(file, content, { ...metaData, secret }, (err) => {
      if (err) return reject(err);

      resolve(secret);
    });
  });
};

const download = (file: string, cb: Function): void => {
  let fileContent = "";
  minioClient.getObject(bucketName, file, (err, dataStream) => {
    if (err || !dataStream) {
      log.error({ err }, "Error during getting file object");
      cb(err);
    } else {
      log.trace("Fetching data from stream");
      dataStream.on("data", (chunk: string) => {
        fileContent += chunk;
      });
      dataStream.on("end", async () => {
        const meta = await getMetadataAsPromised(file);

        cb(null, { data: fileContent, meta });
      });
      dataStream.on("error", function (err) {
        log.error({ err }, "Error during getting file object data-stream");
      });
    }
  });
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

const getMetadata = (fileHash: string, cb: Function): void => {
  minioClient.statObject(bucketName, fileHash, (err, stat: FullStat) => {
    if (err) {
      log.error({ err }, "Error while getting Metadata");
      return cb(err);
    }
    cb(null, stat.metaData);
  });
};

export const getMetadataAsPromised = (
  fileHash: string,
): Promise<MetadataWithName> => {
  return new Promise((resolve, reject) => {
    getMetadata(fileHash, (err, metaData: MetadataWithName) => {
      if (err) return reject(err);

      resolve(metaData);
    });
  });
};

export const getReadiness = async (): Promise<void> => {
  minioClient.listBuckets(function (err, _buckets) {
    if (err) return log.error(err);
  });
};

export const establishConnection = async (): Promise<void> => {
  const retries = 20;
  for (let i = 0; i <= retries; i++) {
    try {
      await makeBucketAsPromised(bucketName);

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
