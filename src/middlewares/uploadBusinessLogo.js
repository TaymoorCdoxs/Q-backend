const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/business/logos");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${new Date().getTime()}-${file.originalname}`);
    },
});

var uploadBusinessLogo = multer({ storage: storage });
module.exports = uploadBusinessLogo;