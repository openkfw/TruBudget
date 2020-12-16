import * as Minio from 'minio';

const minioClient: any = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT as string, 10) || 9000,
    useSSL: true,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minio',
    secretKey: process.env.MINIO_SECRET_KEY || 'minio123',
});

const upload = (file: string, cb: Function) => {
  // Make a bucket called europetrip.
  minioClient.bucketExists('mybucket', function(err, exists) {
    if (err) {
      return console.log(err)
    }
    if (exists) {
      return console.log('Bucket exists.')
    }
  });

  // minioClient.makeBucket('testdir', 'us-east-1', (err) => {
  //   if (err) return console.log('minioClient.makeBucket', err);

  //   console.log('Bucket created successfully in "us-east-1".');

  //   const metaData = {
  //       'Content-Type': 'application/octet-stream',
  //       'X-Amz-Meta-Testing': 1234,
  //       'example': 5678,
  //   };
  //   // Using fPutObject API upload your file to the bucket europetrip.
  //   minioClient.fPutObject('europetrip', 'photos-europe.tar', file, metaData, (err, etag) => {
  //     if (err) return console.log('minioClient.fPutObject', err);
  //     if (err) return cb(err);
  //     console.log('File uploaded successfully.');

  //     return cb(null, etag);
  //   });
  // });
};

export const uploadAsPromised = (file: string) => {
  return new Promise((resolve, reject) => {
    upload(file, (err, etag) => {
      if (err) return reject(err);

      resolve(etag);
    });
  });
};

uploadAsPromised('./result.js');

export default minioClient;
