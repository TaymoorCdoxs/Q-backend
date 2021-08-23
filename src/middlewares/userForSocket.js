const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "../../config/config.env" });
userForSocket = async (token) => {
  if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  }
  if (!token) {
    res.status(200).json({
      status: 401,
      message: "Not authorized to Access",
    });
  }
  try {
    // if (process.env.NODE_ENV !== 'production') {
    //     console.log(token);
    // }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    let value = await User.findByPk(decoded.id);
    return value.dataValues;
    next();
  } catch (err) {
    return "Invalid token";
  }
};
module.exports = userForSocket;
