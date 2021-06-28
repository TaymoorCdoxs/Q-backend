// const mysql = require('../../config/db');
// const util = require('util');
// const query = util.promisify(mysql.query).bind(mysql);

// const db = require('../../src/models/User.model');



exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role_id, device_id } = req.body;
        if (!name || !email || !password || !role_id || !device_id) {
            res.status(200).json({
                status: 200,
                message: 'Please provide all the credentials'
            });
        } else {
            let query_ = "select * from users where email = '" + email + "'";
            const rows = await query(query_);
            if (rows.length > 0) {
                res.status(200).json({
                    status: 200,
                    message: "Email already exists please use a different email"
                })
            } else {
                let createuser_query = "INSERT INTO users (name, email, password, role_id, device_id) values ('" + name + "','" + email + "','" + password + "','" + role_id + "','" + device_id + "')";
                const createUser = await query(createuser_query);
                res.status(200).json({
                    status: 200,
                    message: 'User created'
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: err.message
        })
    }
}

// exports.user = async (req, res, next) => {
//     try {
//         await db.sequelize.sync().then(() => {
//             console.log('Database');
//         })
//     } catch (err) {
//         next(err);
//     }
// }