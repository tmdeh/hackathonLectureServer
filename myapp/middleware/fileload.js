const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = 'images/';
        try {
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error(err)
        }
        cb(null, path);
    },
    filename: (req, file, cb) => {
        const url = '../images/' + file.originalname;
        cb(null, crypto.createHash('sha512').update(url).digest('base64')) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
});

const upload = multer({ storage: storage });
module.exports = upload;