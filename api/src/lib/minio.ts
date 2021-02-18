import * as Minio from "minio";
import { minioEndPoint, minioPort, minioUseSSL, minioAccessKey, minioSecretKey } from "../config";

const Readable = require("stream").Readable;

interface Metadata {
  "Content-Type"?: string;
  fileName: string;
}

interface MetadataWithName extends Metadata {
  name: string;
}

const minioClient: any = new Minio.Client({
  endPoint: minioEndPoint || "nginx",
  port: minioPort,
  useSSL: minioUseSSL,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

const bucketName: string = "trubudget";

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

const upload = (file: string, content: string, metaData: Metadata, cb: Function) => {
  const s = new Readable();
  s._read = () => {};
  s.push(content);
  s.push(null);

  const metaDataWithName: MetadataWithName = { ...metaData, name: file };
  // Using putObject API upload your file to the bucket.
  minioClient.putObject(bucketName, file, s, metaDataWithName, (err: any, etag: any) => {
    if (err) {
      console.error("minioClient.putObject", err);
      return cb(err);
    }

    return cb(null, etag);
  });
};

export const uploadAsPromised = (
  file: string,
  content: string,
  metaData: Metadata = { fileName: "default" },
) => {
  return new Promise((resolve, reject) => {
    upload(file, content, metaData, (err, etag) => {
      if (err) return reject(err);

      resolve(etag);
    });
  });
};

const download = (file: string, cb: Function) => {
  let fileContent: string = "";
  minioClient.getObject(bucketName, file, (err, dataStream) => {
    if (err) {
      console.error("Error during getting file object", err);
      cb(err);
    }
    dataStream.on("data", (chunk: string) => {
      fileContent += chunk;
    });
    dataStream.on("end", () => {
      cb(null, fileContent);
    });
    dataStream.on("error", function (err) {
      console.error("Error during getting file object datastream", err);
    });
  });
};

export const downloadAsPromised = (file: string) => {
  return new Promise((resolve, reject) => {
    download(file, (err, fileContent: string) => {
      if (err) return reject(err);

      resolve(fileContent);
    });
  });
};

const getMetadata = (fileHash: string, cb: Function) => {
  minioClient.statObject(bucketName, fileHash, (err, stat: MetadataWithName) => {
    if (err) {
      console.error(err);
      return cb(err);
    }
    cb(null, stat);
  });
};

export const getMetadataAsPromised = (fileHash: string) => {
  return new Promise((resolve, reject) => {
    getMetadata(fileHash, (err, metaData: MetadataWithName) => {
      if (err) return reject(err);

      resolve(metaData);
    });
  });
};

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const establishConnection = async () => {
  const retries = 20;
  for (let i = 0; i <= retries; i++) {
    try {
      await makeBucketAsPromised(bucketName);

      console.log("Connection with min.io established.");
      break;
    } catch (e) {
      console.error("Problem with establishing connection to min.io and creating bucket.");

      if (i === retries) {
        console.error("Unable to connect with min.io. EXITING!");
        process.exit(1);
      }
      await sleep(20000);
    }
  }
};

if (minioEndPoint) {
  establishConnection();
} else {
  console.log("MINIO_ENDPOINT not set. Defaulting to chain storage.");
}

export default minioClient;
