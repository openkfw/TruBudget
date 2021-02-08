import * as Minio from "minio";
import { v4 as uuid } from "uuid";
import { minioEndPoint, minioPort, minioUseSSL, minioAccessKey, minioSecretKey } from "../config";

const Readable = require("stream").Readable;

interface Metadata {
  "Content-Type"?: string,
  fileName: string,
}

interface MetadataWithName extends Metadata {
  name: string
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
  minioClient.bucketExists(bucket, (err, exists) => {
    if (err) {
      return console.error("Error during searching for bucket", err);
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
  // Using putObject API upload your file to the bucket .
  minioClient.putObject(bucketName, file, s, metaDataWithName, (err, etag) => {
    if (err) {
      console.error("minioClient.putObject", err);
      return cb(err);
    }

    return cb(null, etag);
  });
};

export const uploadAsPromised = (file: string, content: string, metaData: Metadata = {fileName: "default"}) => {
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

makeBucketAsPromised(bucketName);

export default minioClient;
