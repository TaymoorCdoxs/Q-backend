const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/profiles/receptionist");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${new Date().getTime()}-${file.originalname}`);
    },
});

var uploadProfileImage = multer({ storage: storage });
module.exports = uploadProfileImage;