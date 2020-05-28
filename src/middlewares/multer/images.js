const multer = require('multer');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const md5 = require('md5');


const imageUploadMiddleware = (imagePropName) => multer({
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
  limits: 5 * 1024 * 1024,
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const filePath = `public${req.originalUrl.replace('api/', '')}`;
      const relativePath = `./${filePath}`;
      if (!fs.existsSync(relativePath)) {
        shell.mkdir('-p', relativePath);
      }
      req.body[imagePropName] = `${process.env.HOST}/${filePath}`;
      cb(null, relativePath);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      const fileName = `${md5(new Date().getMilliseconds())}${ext}`;
      req.body[imagePropName] += fileName;
      cb(null, fileName);
    },
  }),
}).single(imagePropName);

module.exports = {
  imageUploadMiddleware,
};
