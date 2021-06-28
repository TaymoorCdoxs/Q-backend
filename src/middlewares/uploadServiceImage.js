const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/corporate/services");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${new Date().getTime()}-${file.originalname}`);
    },
});

var uploadServiceImage = multer({ storage: storage });
module.exports = uploadServiceImage;