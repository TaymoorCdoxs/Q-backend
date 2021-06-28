const Table = require('../../../../models/Table.model');
const User = require('../../../../models/User.model');
const Restaurant = require('../../../../models/Restaurant.model');
const Employee = require('../../../../models/Employee.model');
const checkEmpty = require('../../../../middlewares/checkEmpty.mid');

exports.viewAllTables = async (req, res, next) => {
    try {
        Restaurant.hasMany(Table, { foreignKey: "restaurant_id" });
        Table.belongsTo(Restaurant, { foreignKey: "restaurant_id" });
        let restaurant = await Restaurant.findOne({
            where: { user_id: req.user.id }, include: [{
                model: Table
            }]
        });
        if (restaurant) {
            res.status(200).json({
                status: 200,
                restaurant
            })
        } else {
            res.status(200).json({
                status: 200,
                restaurant: []
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: "Error while fetching data"
        })
    }
}
exports.createTables = async (req, res, next) => {
    try {
        let restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (restaurant) {
            let {
                name,
                family,
                person_count
            } = req.body;
            if (checkEmpty(name) || checkEmpty(family) || checkEmpty(person_count)) {
                res.status(200).json({
                    status: 400,
                    message: "Please provide all required fields"
                })
            } else {
                const table = await Table.create({
                    name: name,
                    family: family,
                    person_count: person_count,
                    restaurant_id: restaurant.id,
                    status: 1
                });
                if (table) {
                    res.status(200).json({
                        status: 200,
                        message: "Tables created successfully"
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while creating table"
                    })
                }
            }

        } else {
            res.status(200).json({
                status: 400,
                message: "Error while creating table"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating table"
        })
    }
}
exports.deleteTable = async (req, res, next) => {
    try {
        let { table_ToBe_deleted } = req.body;
        let table = await Table.findByPk(table_ToBe_deleted);
        if (table) {
            let delete_table = await Table.destroy({ where: { id: table_ToBe_deleted } });
            res.status(200).json({
                status: 200,
                message: "Table deleted"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while deleting table"
        })
    }
}
exports.editTables = async (req, res, next) => {
    try {
        let { table_id, name, family, person_count } = req.body;
        if (checkEmpty(table_id) || checkEmpty(name) || checkEmpty(family) || checkEmpty(person_count)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            let table = await Table.findOne({ where: { id: table_id } });
            if (table) {
                const update_table = await Table.update({ name: name, family: family, person_count: person_count }, { where: { id: table_id } });
                if (update_table) {
                    res.status(200).json({
                        status: 200,
                        message: "Table details updated successfully"
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while updating table"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Table not found"
                })
            }
        }
    } catch (err) {
        next(err);
    }
}

