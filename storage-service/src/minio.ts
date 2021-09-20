import * as Minio from "minio";
import { v4 } from "uuid";
import config from "./config";

const Readable = require("stream").Readable;

interface Metadata {
  "Content-Type"?: string;
  fileName: string;
  docId: string;
  secret?: string;
}

interface MetadataWithName extends Metadata {
  name: string;
}

interface FullStat {
  size: number;
  metaData: MetadataWithName;
  lastModified: Date;
  etag: string;
}

interface FileWithMeta {
  data: string;
  meta: MetadataWithName;
}

const minioClient: any = new Minio.Client({
  endPoint: config.storage.host,
  port: config.storage.port,
  useSSL: false,
  accessKey: config.storage.accessKey,
  secretKey: config.storage.secretKey,
});

const bucketName: string = config.storage.bucketName;

const makeBucket = (bucket: string, cb: Function) => {
  minioClient.bucketExists(bucket, (err: any, exists: any) => {
    if (err) {
      console.error("Error during searching for bucket", err);
      return cb(err);
    }

    if (!exists) {
      minioClient.makeBucket(bucket, "us-east-1", (err) => {
        if (err) {
          console.error("Error creating bucket.", err);
          return cb(err);
        }
        console.log(`Minio: Bucket ${bucket} created.`);
        return cb(null, true);
      });
    }
    return cb(null, true);
  });
};

export const makeBucketAsPromised = (bucket: string) => {
  return new Promise((resolve, reject) => {
    makeBucket(bucket, (err) => {
      if (err) return reject(err);

      resolve(true);
    });
  });
};

const upload = (
  file: string,
  content: string,
  metaData: Metadata,
  cb: Function,
) => {
  const s = new Readable();
  s._read = () => {};
  s.push(content);
  s.push(null);

  const metaDataWithName: MetadataWithName = { ...metaData, name: file };
  // Using putObject API upload your file to the bucket.
  minioClient.putObject(
    bucketName,
    file,
    s,
    metaDataWithName,
    (err: any, etag: any) => {
      if (err) {
        console.error("minioClient.putObject", err);
        return cb(err);
      }

      return cb(null, etag);
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

const download = (file: string, cb: Function) => {
  let fileContent: string = "";
  minioClient.getObject(bucketName, file, (err, dataStream) => {
    if (err || !dataStream) {
      console.error("Error during getting file object", err);
      cb(err);
    } else {
      dataStream.on("data", (chunk: string) => {
        fileContent += chunk;
      });
      dataStream.on("end", async () => {
        const meta = await getMetadataAsPromised(file);

        cb(null, { data: fileContent, meta });
      });
      dataStream.on("error", function (err) {
        console.error("Error during getting file object datastream", err);
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

const getMetadata = (fileHash: string, cb: Function) => {
  minioClient.statObject(bucketName, fileHash, (err, stat: FullStat) => {
    if (err) {
      console.error(err);
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

export const getReadiness = async () => {
  minioClient.listBuckets(function (err, buckets) {
    if (err) return console.log(err);
  });
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const establishConnection = async () => {
  const retries = 20;
  for (let i = 0; i <= retries; i++) {
    try {
      await makeBucketAsPromised(bucketName);

      console.log("Connection with min.io established.");
      break;
    } catch (e) {
      console.error(
        "Problem with establishing connection to min.io and creating bucket.",
      );

      if (i === retries) {
        console.error("Unable to connect with min.io. EXITING!");
        process.exit(1);
      }
      await sleep(20000);
    }
  }
};

export default minioClient;
