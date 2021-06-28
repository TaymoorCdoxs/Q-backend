const Corporate_PanelModel = require("../../models/Corporate_Panel.model");
const RestaurantModel = require("../../models/Restaurant.model");
const UserModel = require("../../models/User.model");
const { Op } = require('sequelize');
const RequestsModel = require("../../models/Requests.model");
const checkEmpty = require("../../middlewares/checkEmpty.mid");
const Corporate_OrdersModel = require("../../models/Corporate_Orders.model");
const EmployeeModel = require("../../models/Employee.model");
let moment = require('moment');
let _ = require('lodash');
const Corporate_Panel_DepartmentsModel = require("../../models/Corporate_Panel_Departments.model");
const ServicesModel = require("../../models/Services.model");

UserModel.hasOne(Corporate_PanelModel, { foreignKey: 'user_id' });
Corporate_PanelModel.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasOne(RequestsModel, { foreignKey: 'user_id' });
RequestsModel.belongsTo(UserModel, { foreignKey: 'user_id' });
UserModel.hasOne(RestaurantModel, { foreignKey: 'user_id' });
RestaurantModel.belongsTo(UserModel, { foreignKey: 'user_id' });



// ------------------------ Admin API's ----------------

exports.adminDashboard = async (req, res, next) => {
    try {
        if (req.user.role_id == 0) {
            let restaurants = 0;
            let hospitals = 0;
            let customer_services = 0;
            let users_registered = 0;

            hospitals = await Corporate_PanelModel.count();
            restaurants = await RestaurantModel.count();
            users_registered = await UserModel.count({ where: { role_id: { [Op.eq]: 1 } } })

            res.status(200).json({
                status: 200,
                hospitals,
                restaurants,
                customer_services,
                users_registered
            })
        } else {
            res.status(401).json({
                status: 401,
                message: "Not authorized to access"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        });
    }
}
exports.adminDashboardRestaurants = async (req, res, next) => {
    try {
        if (req.user.role_id == 0) {
            let restaurants = 0;
            let query_1 = "SELECT us.name as owner_name, us.email as owner_email, r.id as corporate_id, r.user_id as user_id, req.id as request_id, req.* "
            query_1 += "FROM `restaurants` r "
            query_1 += "JOIN `requests` req ON req.user_id=r.user_id "
            query_1 += "JOIN `users` us ON us.id=r.user_id"
            restaurants = await sequelize.query(query_1, { type: sequelize.QueryTypes.SELECT });
            if (restaurants == null) {
                restaurants = []
            }
            res.status(200).json({
                status: 200,
                restaurants
            })
        } else {
            res.status(401).json({
                status: 401,
                message: "Not authorized to access"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        });
    }
}
exports.adminDashboardHospitals = async (req, res, next) => {
    try {
        if (req.user.role_id == 0) {
            let hospitals = 0;
            let query_1 = "Select us.email as owner_email, us.name as owner_name, "
            query_1 += " cp.id as corporate_id, req.* "
            query_1 += " from corporate_panels cp "
            query_1 += " join requests req on req.user_id=cp.user_id"
            query_1 += " join users us on cp.user_id=us.id"
            hospitals = await sequelize.query(query_1, { type: sequelize.QueryTypes.SELECT });

            if (hospitals == null) {
                hospitals = []
            }

            res.status(200).json({
                status: 200,
                hospitals
            })
        } else {
            res.status(401).json({
                status: 401,
                message: "Not authorized to access"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        });
    }
}
exports.viewCorporateHospitalDetails = async (req, res, next) => {
    try {
        let { hospital_id } = req.body
        // console.log(req.body)
        if (checkEmpty(hospital_id)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            let total_served = 0;
            let total_serving = 0;
            let total_in_queue = 0;

            // Total analytics related to corporate
            let corporate = await Corporate_PanelModel.findOne({ where: { id: hospital_id } });
            if (corporate) {
                total_served = await customerDetails(corporate.dataValues.id, 1)
                total_serving = await customerDetails(corporate.dataValues.id, 2)
                total_in_queue = await customerDetails(corporate.dataValues.id, 3)

                // Total Employees
                let employees = await getTotalEmployees(corporate.dataValues.user_id);
                // Average Timings
                let service = await Corporate_OrdersModel.findAll({
                    where: {
                        corporate_id: corporate.dataValues.id,
                        status: "cleared",
                    },
                    raw: true
                });
                let estimated_times = []
                if (service.length > 0) {
                    estimated_times = await estimated_times_for_hospitals(service)
                }

                let averageFunction = await Corporate_OrdersModel.findAll({
                    where: { corporate_id: corporate.dataValues.id, rating: { [Op.ne]: null } },
                    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
                    raw: true,
                });

                if (averageFunction[0].avg_rating == null) {
                    averageFunction[0].avg_rating = 0
                }

                let departments_of_corporate = await Corporate_Panel_DepartmentsModel.findAll({
                    where: {
                        parent_id: corporate.dataValues.id
                    }
                });

                res.status(200).json({
                    status: 200,
                    total_served: total_served.length,
                    total_served_list: total_served,
                    total_serving: total_serving.length,
                    total_serving_list: total_serving,
                    total_in_queue: total_in_queue.length,
                    total_in_queue_list: total_in_queue,
                    total_employees: employees.length,
                    total_employees_list: employees,
                    average_rating: parseFloat(averageFunction[0].avg_rating),
                    departments_of_corporate,
                    estimated_times
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while fetching corporate data"
                });
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        });
    }
}
exports.viewAllUsers = async (req, res, next) => {
    try {
        if (req.user.role_id == 0) {
            let users = await UserModel.findAll({
                where: {
                    role_id: 1
                },
                raw: true
            });
            if (users == null) {
                users = []
            }
            res.status(200).json({
                status: 200,
                users
            })
        } else {
            res.status(200).json({
                status: 401,
                message: "Not authorized to access this page"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        })
    }
}


// ------------------------- Utility Functions ------------------------
let count_time_difference = async (date1, date2) => {
    let start = moment(new Date(date1));
    let end = moment(new Date(date2));
    let duration = moment.duration(end.diff(start));
    return duration.asMinutes()
}
let estimated_times_for_hospitals = async (service) => {
    let time_diff_for_waiting = []
    let time_diff_for_serving = []
    for (let i = 0; i < service.length; i++) {
        if (service[i].in_waiting !== null && service[i].in_working !== null) {
            let time = await count_time_difference(service[i].in_waiting, service[i].in_working)
            time_diff_for_waiting.push(time);
        }
        if (service[i].in_working !== null && service[i].done_queue !== null) {
            let time = await count_time_difference(service[i].in_working, service[i].done_queue)
            time_diff_for_serving.push(time);
        }
    }
    if (time_diff_for_waiting.length == 1) {
        estimated_time_for_waiting = time_diff_for_waiting[0];
    } else {
        estimated_time_for_waiting = _.mean(time_diff_for_waiting)
    }
    if (time_diff_for_serving.length == 1) {
        estimated_time_for_serving = time_diff_for_serving[0];
    } else {
        estimated_time_for_serving = _.mean(time_diff_for_serving)
    }

    let times = [
        { estimated_time_for_waiting },
        { estimated_time_for_serving }]
    return times
}
let customerDetails = async (corporate_id, status) => {
    UserModel.hasOne(Corporate_OrdersModel, { foreignKey: 'user_id' });
    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    ServicesModel.hasOne(Corporate_OrdersModel, { foreignKey: 'service_id' });
    Corporate_OrdersModel.belongsTo(ServicesModel, { foreignKey: 'service_id' });
    EmployeeModel.hasOne(Corporate_OrdersModel, { foreignKey: 'employee_id' });
    Corporate_OrdersModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });
    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    if (status == 1) {
        let total_served = await Corporate_OrdersModel.findAll({
            where: {
                corporate_id,
                status: { [Op.eq]: 'cleared' }
            },
            include: [{
                model: ServicesModel
            }, {
                model: UserModel
            }, {
                model: EmployeeModel,
                include: [{
                    model: UserModel
                }],
            }
            ]
        })
        return total_served
    } else if (status == 2) {
        let total_serving = await Corporate_OrdersModel.findAll({
            where: {
                corporate_id,
                status: { [Op.eq]: 'working' }
            },
            include: [{
                model: ServicesModel
            }, {
                model: UserModel
            }, {
                model: EmployeeModel,
                include: [{
                    model: UserModel
                }],
            }
            ]
        })
        return total_serving
    } else if (status == 3) {
        let total_in_queue = await Corporate_OrdersModel.findAll({
            where: {
                corporate_id,
                status: { [Op.eq]: 'waiting' }
            },
            include: [{
                model: ServicesModel
            }, {
                model: UserModel
            }, {
                model: EmployeeModel,
                include: [{
                    model: UserModel
                }],
            }
            ]
        })
        return total_in_queue
    }
}
let getTotalEmployees = async (panel_id) => {
    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    let total_employees = await EmployeeModel.findAll({
        where:
        {
            panel_id
        },
        include: [{
            model: UserModel,
        }],
        raw: true
    });

    return total_employees
}