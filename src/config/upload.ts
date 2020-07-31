import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const tmpUpload = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  directory: tmpUpload,

  storage: multer.diskStorage({
    destination: tmpUpload,
    filename(request, file, callback) {
      const hash = crypto.randomBytes(10).toString('hex');
      const fileName = `${hash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
