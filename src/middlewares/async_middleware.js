const fs = require('fs');

const asyncMiddleware = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => {
    const { files, file } = req;
    const forDelete = [];
    if (file && file.path) {
      forDelete.push(`./${file.path}`);
    }
    if (files) {
      if (Array.isArray(files)) {
        files.forEach((file) => {
          if (file.path) {
            forDelete.push(`./${file.path}`);
          }
        });
      } else if (typeof files === 'object') {
        Object.values(files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (file.path) {
              forDelete.push(`./${file.path}`);
            }
          });
        });
      }
    }
    forDelete.forEach((file) => {
      fs.unlink(file, () => {});
    });
    next(err);
  });
};

module.exports = asyncMiddleware;
