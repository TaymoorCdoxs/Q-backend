const multer = require("multer");

// const imageFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image")) {
//         cb(null, true);
//     } else {
//         cb("Please upload only images.", false);
//     }
// };

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/restaurants/menu/dishes");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${new Date().getTime()}-${file.originalname}`);
    },
});

var uploadFile = multer({ storage: storage });
module.exports = uploadFile;