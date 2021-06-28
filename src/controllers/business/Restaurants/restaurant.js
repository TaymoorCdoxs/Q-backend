const User = require('../../../models/User.model');
const Employee = require('../../../models/Employee.model');
const Restaurant = require('../../../models/Restaurant.model');
const checkEmpty = require('../../../middlewares/checkEmpty.mid');
const Request = require('../../../models/Requests.model');
const bcrypt = require('bcrypt');
const Table = require('../../../models/Table.model');
const Restaurant_dine_inModel = require('../../../models/Restaurant_dine_in.model');
const Restaurant_Take_AwayModel = require('../../../models/Restaurant_Take_Away.model');
const RestaurantModel = require('../../../models/Restaurant.model');
const UserModel = require('../../../models/User.model');

// ---------------------------Restaurant API's---------------------------------
exports.saveRestaurantDetails = async (req, res, next) => {
    try {
        let {
            company_name,
            dine_in,
            take_away,
            two_persons,
            four_persons,
            total_table,
            allow,
            f_two_persons,
            f_four_persons,
            no_of_employee
        } = req.body;
        // console.log(req.body);
        // if (checkEmpty(dine_in) === true ||
        //     checkEmpty(take_away) === true ||
        //     checkEmpty(two_persons) === true ||
        //     checkEmpty(four_persons) === true ||
        //     checkEmpty(total_table) === true ||
        //     checkEmpty(allow) === true ||
        //     checkEmpty(f_two_persons) === true ||
        //     checkEmpty(f_four_persons) === true ||
        //     checkEmpty(no_of_employee) === true) {
        //     res.status(200).json({
        //         status: 400,
        //         message: "Please provide all the required fields"
        //     })
        // } else {
        let restaurant = await Restaurant.create({
            user_id: req.user.id,
            dine_in,
            name: 1,
            take_away,
            two_persons,
            four_persons,
            total_table,
            allow,
            f_two_persons,
            f_four_persons,
            no_of_employee
        });
        console.log(restaurant)

        if (restaurant) {
            let failed = false;
            for (let i = 0; i < two_persons; i++) {
                if (f_two_persons > 0) {
                    let table = await Table.create({
                        restaurant_id: restaurant.dataValues.id,
                        person_count: 2,
                        name: "table-for-two-" + i,
                        status: 1,
                        family: 1
                    })
                    f_two_persons--
                    if (table) {
                        failed = false
                    } else {
                        failed = true
                    }
                } else {
                    let table = await Table.create({
                        restaurant_id: restaurant.dataValues.id,
                        person_count: 2,
                        name: "table-for-two-" + i,
                        status: 1,
                        family: 0
                    })
                    if (table) {
                        failed = false
                    } else {
                        failed = true
                    }
                }
            }
            for (let i = 0; i < four_persons; i++) {
                if (f_four_persons > 0) {
                    let table = await Table.create({
                        restaurant_id: restaurant.dataValues.id,
                        person_count: 4,
                        name: "table-for-four-" + i,
                        status: 1,
                        family: 1
                    })
                    f_four_persons -= f_four_persons
                    if (table) {
                        failed = false
                    } else {
                        failed = true
                    }
                } else {
                    let table = await Table.create({
                        restaurant_id: restaurant.dataValues.id,
                        person_count: 4,
                        name: "table-for-four-" + i,
                        status: 1,
                        family: 0
                    })
                    if (table) {
                        failed = false
                    } else {
                        failed = true
                    }
                }
            }
            for (let i = 0; i < no_of_employee; i++) {
                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash("11111111", salt);
                let new_comp_name = company_name.split(" ");
                let user = await User.create({
                    name: company_name,
                    email: `employee${i}@${new_comp_name[0].toLowerCase()}.com`,
                    role_id: 2,
                    password: hash
                });
                if (user) {
                    failed = false
                } else {
                    failed = true
                }
                let employee = await Employee.create({
                    user_id: user.id,
                    panel_id: req.user.id
                });
                if (employee) {
                    failed = false
                } else {
                    failed = true
                }
            }

            if (failed) {
                res.status(200).json({
                    status: 400,
                    message: "Error while saving restaurant details"
                })
            } else {
                res.status(200).json({
                    status: 200,
                    corporate_id: restaurant.dataValues.id,
                    message: "Restaurant details saved successfully!"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while saving restaurant details"
            })
        }
        // }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while saving restaurant details"
        })
    }
}
exports.viewRestaurantDetails = async (req, res, next) => {
    try {
        let user_id = req.user.id;
        let user_email = req.user.email
        let restaurant = await Restaurant.findAll({ where: { user_id: user_id } });
        const business = await Request.findAll({ where: { user_id: user_id } });
        res.status(200).json({
            status: 200,
            business: {
                email: user_email,
                business: business[0].company_name
            },
            restaurant: restaurant
        })
    } catch (err) {
        next(err);
    }
}
exports.dashboard = async (req, res, next) => {
    try {
        let { status, restaurant_id } = req.body;
        if (status == 0) {
            let restaurant = await RestaurantModel.findOne({ where: { user_id: req.user.id } });
            if (restaurant) {
                returnDashboardDetails(restaurant.dataValues.id, res, next);
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Error while fetching data"
                })
            }
        } else if (status == 1) {
            let restaurant = await RestaurantModel.findByPk(restaurant_id);
            if (restaurant) {
                returnDashboardDetails(restaurant.dataValues.id, res, next);
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Error while fetching data"
                })
            }
        }
    } catch (err) {
        next(err);

    }
}
exports.viewEmployees = async (req, res, next) => {
    try {
        User.hasOne(Employee, { foreignKey: 'user_id' });
        Employee.belongsTo(User, { foreignKey: 'user_id' });
        console.log(req.user.id)
        let data = await Employee.findAll({
            where: { panel_id: req.user.id },
            include: [{
                model: User
            }]
        });
        res.status(200).json({
            status: 200,
            employees: data
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: "Error while fetching data"
        })
    }
}

// -----------------------------functions---------------------------------------
let returnDashboardDetails = async (restaurant_id, res, next) => {
    try {
        let totalCustomersServed = 0;
        let totalCustomersWaiting = 0;
        let totalCustomersInQueue = 0;
        let totalCustomersWorking = 0;
        let averageRating = 0;
        let totalRatings = 0;
        let totalRatingsGiven = 0

        let dine_In_orders = await Restaurant_dine_inModel.findAll({ where: { restaurant_id: restaurant_id } });
        let take_away_Orders = await Restaurant_Take_AwayModel.findAll({ where: { restaurant_id: restaurant_id } });
        if (dine_In_orders.length > 0) {
            for (let i = 0; i < dine_In_orders.length; i++) {
                if (dine_In_orders[i].dataValues.status == 'waiting') {
                    totalCustomersWaiting++
                } else if (dine_In_orders[i].dataValues.status == 'in-queue') {
                    totalCustomersInQueue++
                } else if (dine_In_orders[i].dataValues.status == 'done') {
                    totalCustomersServed++
                } else if (dine_In_orders[i].dataValues.status == 'working') {
                    totalCustomersWorking++
                }
                if (dine_In_orders[i].dataValues.rating !== null) {
                    totalRatings += dine_In_orders[i].dataValues.rating
                    totalRatingsGiven++
                }
            }
        }
        if (take_away_Orders.length > 0) {
            for (let i = 0; i < take_away_Orders.length; i++) {
                if (take_away_Orders[i].dataValues.status == 'done') {
                    totalCustomersServed++
                } else if (take_away_Orders[i].dataValues.status == 'waiting') {
                    totalCustomersWaiting++
                } else if (take_away_Orders[i].dataValues.status == 'working') {
                    totalCustomersWorking++
                }
                if (take_away_Orders[i].dataValues.rating !== null) {
                    totalRatings += take_away_Orders[i].dataValues.rating
                    totalRatingsGiven++
                }
            }
        }

        if (totalRatingsGiven <= 0) {
            averageRating = 0
        } else {
            averageRating = ((totalRatings) / (totalRatingsGiven))
        }
        res.status(200).json({
            status: 200,
            totalCustomersServed,
            totalCustomersWaiting,
            totalCustomersInQueue,
            totalCustomersWorking,
            dine_In_orders,
            take_away_Orders,
            averageRating
        })
    } catch (err) {
        next(err);
    }
}