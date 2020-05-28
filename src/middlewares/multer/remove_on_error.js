const S3 = require('aws-sdk/clients/s3');
const { AWS_CONFIG, AWS_BUCKET_NAME } = require('../../config/aws-s3');

const s3Client = new S3(AWS_CONFIG);

const asyncRemoveFilesOnError = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => {
    const { files, file } = req;
    const forDelete = [];
    if (file && file.key) {
      forDelete.push(file.key);
    }
    if (files) {
      if (Array.isArray(files)) {
        files.forEach((file) => {
          if (file.key) {
            forDelete.push(file.key);
          }
        });
      } else if (typeof files === 'object') {
        Object.values(files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (file.key) {
              forDelete.push(file.key);
            }
          });
        });
      }
    }
    s3Client.deleteObjects({
      Bucket: AWS_BUCKET_NAME,
      Delete: {
        Objects: forDelete.map((key) => ({ Key: key })),
      },
    });
    next(err);
  });
};


module.exports = { asyncRemoveFilesOnError };
