const multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./assets/restaurants/menu/categories");
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${new Date().getTime()}-${file.originalname}`);
    },
});

var uploadcategoryImage = multer({ storage: storage });
module.exports = uploadcategoryImage;