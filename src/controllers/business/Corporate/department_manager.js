const checkEmpty = require('../../../middlewares/checkEmpty.mid');
const CorporatePanel = require('../../../models/Corporate_Panel.model');
const Corporate_panel_department = require('../../../models/Corporate_Panel_Departments.model');
const RequestsModel = require('../../../models/Requests.model');
const UserModel = require('../../../models/User.model');
const Service = require('../../../models/Services.model');
const EmployeeModel = require('../../../models/Employee.model');
const bcrypt = require('bcrypt');
const accessToken = require('../../../middlewares/token.mid');
const Corporate_OrdersModel = require('../../../models/Corporate_Orders.model');
const { Op } = require('sequelize');
const Corporate_PanelModel = require('../../../models/Corporate_Panel.model');
let moment = require('moment');
const _ = require("lodash");
const ServicesModel = require('../../../models/Services.model');

exports.departmentManagerDashboard = async (req, res, next) => {
    try {
        let { corporate_department_id } = req.body;
        let total_served = 0;
        let total_serving = 0;
        let total_in_queue = 0;
        let total_employees = 0;
        if (checkEmpty(corporate_department_id)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            // Total analytics related to corporate
            let corporate_department = await Corporate_panel_department.findByPk(corporate_department_id);
            if (corporate_department) {
                let corporate = await CorporatePanel.findByPk(corporate_department.corporate_panel_id);
                if (corporate) {
                    // Customer details
                    total_served = await customerDetails(corporate_department_id, 1)
                    total_serving = await customerDetails(corporate_department_id, 2)
                    total_in_queue = await customerDetails(corporate_department_id, 3)
                    // Total Employees
                    total_employees = await getTotalEmployees(corporate.user_id, corporate_department.id)
                    let service = await Corporate_OrdersModel.findAll({
                        where: {
                            corporate_id: corporate.id,
                            status: "cleared",
                            department_id: corporate_department.id
                        },
                        raw: true
                    });
                    let estimated_times = []
                    if (service.length > 0) {
                        estimated_times = await estimated_times_func(service)
                    } else {
                        estimated_times = [{ estimated_time_for_waiting: 0 },
                        { estimated_time_for_serving: 0 }];
                    }

                    let averageDepartmentRating = await getAverageDepartmentRating(corporate.id, corporate_department.id)
                    let services = await ServicesModel.count({ where: { department_id: corporate_department.id } });
                    let manager = await getManager(corporate_department.id);

                    res.status(200).json({
                        status: 200,
                        total_served: total_served.length,
                        total_served_list: total_served,
                        total_serving: total_serving.length,
                        total_serving_list: total_serving,
                        total_in_queue: total_in_queue.length,
                        total_in_queue_list: total_in_queue,
                        total_employees,
                        average_rating: averageDepartmentRating,
                        services,
                        manager,
                        estimated_times
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while fetching corporate data"
                    });
                }

            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while fetching corporate department data"
                });
            }
        }
    } catch (err) {
        next(err);
    }
}

// ------------------------- Utility Functions ------------------------
let count_time_difference = async (date1, date2) => {
    let start = moment(new Date(date1));
    let end = moment(new Date(date2));
    let duration = moment.duration(end.diff(start));
    return duration.asMinutes()
}
let estimated_times_func = async (service) => {
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
    } else if (time_diff_for_waiting.length == 0) {
        estimated_time_for_waiting = 0
    } else {
        estimated_time_for_waiting = _.mean(time_diff_for_waiting)
    }
    if (time_diff_for_serving.length == 1) {
        estimated_time_for_serving = time_diff_for_serving[0];
    } else if (time_diff_for_serving.length == 0) {
        estimated_time_for_serving = 0

    } else {
        estimated_time_for_serving = _.mean(time_diff_for_serving)
    }


    let times = [{ estimated_time_for_waiting },
    { estimated_time_for_serving }];
    console.log(times)
    return times
}
let getTotalEmployees = async (panel_id, corporate_panel_department_id) => {
    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    let total_employees = await EmployeeModel.count({
        where:
        {
            panel_id,
            corporate_panel_department_id
        },
        include: [{
            model: UserModel,
            where: {
                role_id: { [Op.eq]: 2 }
            }
        }]
    });
    if (total_employees == null || isNaN(total_employees)) {
        total_employees = 0
    }

    return total_employees
}
let customerDetails = async (department_id, status) => {
    UserModel.hasOne(Corporate_OrdersModel, { foreignKey: 'user_id' });
    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    ServicesModel.hasOne(Corporate_OrdersModel, { foreignKey: 'service_id' });
    Corporate_OrdersModel.belongsTo(ServicesModel, { foreignKey: 'service_id' });
    EmployeeModel.hasOne(Corporate_OrdersModel, { foreignKey: 'employee_id' });
    Corporate_OrdersModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });
    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    // customersWaiting =
    if (status == 1) {
        let total_served = await Corporate_OrdersModel.findAll({
            where: {
                department_id,
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
                department_id,
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
                department_id,
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
let getAverageDepartmentRating = async (corporate_id, department_id) => {
    let averageFunction = await Corporate_OrdersModel.findAll({
        where:
        {
            corporate_id,
            rating: { [Op.ne]: null },
            department_id
        },
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']],
        raw: true,
    });
    if (averageFunction[0].avg_rating == null) {
        averageFunction[0].avg_rating = 0
    }
    let average = parseFloat(averageFunction[0].avg_rating)
    return average
}
let getManager = async (corporate_panel_department_id) => {
    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
    let manager = await EmployeeModel.findOne({
        where: {
            corporate_panel_department_id,
        },
        include: [{
            model: UserModel,
            as: 'user',
            where: {
                role_id: 6
            },
        }],
        raw: true
    })
    return manager
}