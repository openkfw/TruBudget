export const host = process.env.API_HOST || "master-api";
export const port = process.env.PORT || 8080;
export const isSsl = process.env.USE_SSL === "ssl" ? true : false;
export const hostPort = `${isSsl ? "https" : "http"}://${host}:${port}`;

export const publicKey = process.env.PUBLIC_KEY?.replace(/\\n/g, "\n") || "examplePublickey";
export const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

export const organization = process.env.ORGANIZATION || "KfW";

export const minioEndPoint = process.env.MINIO_ENDPOINT; // nginx in development
export const minioPort =
  (process.env.MINIO_PORT && parseInt(process.env.MINIO_PORT as string, 10)) || 9000;
export const minioUseSSL = process.env.MINIO_USE_SSL === "true" ? true : false;
export const minioAccessKey = process.env.MINIO_ACCESS_KEY || "minio";
export const minioSecretKey = process.env.MINIO_SECRET_KEY || "minio123";
