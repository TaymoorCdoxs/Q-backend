const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: "../../config/config.env" });
exports.protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];

    }
    if (!token) {
        res.status(200).json({
            status: 401,
            message: "Not authorized to Access"
        })
    }
    try {
        // if (process.env.NODE_ENV !== 'production') {
        //     console.log(token);
        // }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        let value = await User.findByPk(decoded.id);
        req.user = value.dataValues;
        next();
    } catch (err) {
        res.status(200).json({
            status: 401,
            message: "Not authorized to Access"
        });
    }
}