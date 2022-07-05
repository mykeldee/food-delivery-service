const path = require('path');
const fs = require('fs');
const multer = require('multer');

const tmpDirPath = path.resolve('tmp');
if (!fs.existsSync(tmpDirPath)) {
    fs.mkdirSync(tmpDirPath);
}
const uploadPath = tmpDirPath + '/uploads';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

/**
 *	multer setting for photo upload storage and filename setting, also
 *	set the file details in request object
 */
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});


/**
 *	Function to set storage for single upload, named as FILENAME
 */
const upload = multer({ storage: storage });

module.exports = upload;
