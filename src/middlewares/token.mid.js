const jwt = require('jsonwebtoken');
const accessToken = async (user) => {
    console.log(user)
    return await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
}

module.exports = accessToken