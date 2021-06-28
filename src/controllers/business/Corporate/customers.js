const UserModel = require('../../../models/User.model');
const CorporatePanel = require('../../../models/Corporate_Panel.model');
const Corporate_panel_department = require('../../../models/Corporate_Panel_Departments.model');
const bcrypt = require('bcrypt');
const Services = require('../../../models/Services.model');
const accessToken = require('../../../middlewares/token.mid');
const Corporate_PanelModel = require('../../../models/Corporate_Panel.model');
const Corporate_Panel_Orders = require('../../../models/Corporate_Orders.model');
const { Op } = require('sequelize');
var _ = require('lodash');
const checkEmpty = require('../../../middlewares/checkEmpty.mid');
let moment = require('moment');
const ServicesModel = require('../../../models/Services.model');
const InsuranceModel = require('../../../models/Insurance.model');
const EmployeeModel = require('../../../models/Employee.model');

exports.customerLoginForCorporate = async (req, res, next) => {
    try {
        const { customer_name, customer_number, gender } = req.body;
        if (checkEmpty(customer_number) || checkEmpty(customer_name)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let user = await login(customer_name, customer_number, gender);
            if (user) {
                res.status(200).json({
                    status: 200,
                    token: await accessToken(user),
                    message: user
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Invalid credentials"
                })
            }
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
exports.viewCurrentCustomersInQueue = async (req, res, next) => {
    try {
        let { corporate_department_id, employee_id, service_id } = req.body;
        let corporateOrdersWaiting = await Corporate_Panel_Orders.count(
            {
                where:
                {
                    status: {
                        [Op.eq]: "waiting"
                    },
                    employee_id: employee_id,
                    department_id: corporate_department_id,
                    service_id: service_id,
                    createdAt: { [Op.gt]: new Date(moment().subtract(1, 'days')) }
                }
            });
        let corporateOrdersInWorking = await Corporate_Panel_Orders.count(
            {
                where:
                {
                    status: {
                        [Op.eq]: "working"
                    },
                    employee_id: employee_id,
                    department_id: corporate_department_id,
                    service_id: service_id,
                    createdAt: { [Op.gt]: new Date(moment().subtract(1, 'days')) }
                }
            });
        let query = " SELECT e.id as employee_id , u.name as employee_name FROM employees e  JOIN `users` u ON u.id=e.user_id WHERE (e.id=" + employee_id + ")"
        let employee = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })

        let yesterday = new Date(moment().subtract(1, 'days'))
        console.log(yesterday.toISOString())
        let query_2 = "  SELECT  SUM(s.estimated_time) AS estimated_time FROM `corporate_orders` co"
        query_2 += " JOIN `services` s ON s.id=co.service_id"
        query_2 += ` WHERE (co.status='waiting' AND co.service_id=${service_id} AND co.employee_id=${employee_id} AND 
        co.department_id=${corporate_department_id} AND co.user_id!=${req.user.id} AND co.createdAt > '${yesterday.toISOString()}' )`
        console.log(query_2)

        let time = await sequelize.query(query_2, { type: sequelize.QueryTypes.SELECT });
        let estimated_time = 0;
        if (time[0].estimated_time == null) {
            estimated_time = 0
        } else {
            estimated_time = time[0].estimated_time
        }
        res.status(200).json({
            status: 200,
            waiting: parseInt(corporateOrdersWaiting),
            serving: parseInt(corporateOrdersInWorking),
            estimated_time: parseInt(estimated_time),
            employee
        });

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        })
    }
}
exports.assignTicket = async (req, res, next) => {
    try {
        let { corporate_department_id, service_id, status } = req.body;
        if (status == 0) {
            let corporateOrders = await Corporate_Panel_Orders.findAll(
                {
                    limit: 1,
                    where:
                    {
                        status: { [Op.ne]: 'done' },
                        employee_id: null,
                        department_id: corporate_department_id,
                        service_id: service_id,
                        user_id: req.user.id
                    },
                    order: [['createdAt', 'DESC']]
                });
            if (corporateOrders.length > 0) {
                res.status(200).json({
                    status: 200,
                    order: corporateOrders[0].dataValues
                })
            } else {
                let department = await Corporate_panel_department.findByPk(corporate_department_id)
                if (department) {
                    let lastTicket = await totalTIcket_Count(corporate_department_id, service_id)
                    let ticketNo = parseInt(lastTicket) + 1;
                    let newOrder = await Corporate_Panel_Orders.create({
                        user_id: req.user.id,
                        employee_id: null,
                        department_id: corporate_department_id,
                        corporate_id: department.corporate_panel_id,
                        ticket_type: parseInt(0),
                        service_id: service_id,
                        ticket_no: parseInt(ticketNo),
                        status: 'waiting',
                        in_waiting: new Date()
                    });
                    if (newOrder) {
                        res.status(200).json({
                            status: 200,
                            message: 'new order placed',
                            order: newOrder
                        })
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: 'Error while assigning ticket'
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 200,
                        message: "Error while fetching department"
                    })
                }
            }
        } else if (status == 1) {
            let corporateOrders = await Corporate_Panel_Orders.findAll(
                {
                    limit: 1,
                    where:
                    {
                        status: { [Op.ne]: 'done' },
                        employee_id: null,
                        department_id: corporate_department_id,
                        service_id: service_id,
                        user_id: req.user.id
                    },
                    order: [['createdAt', 'DESC']]
                });
            if (corporateOrders.length > 0) {
                res.status(200).json({
                    status: 200,
                    order: corporateOrders[0].dataValues
                })
            } else {
                let department = await Corporate_panel_department.findByPk(corporate_department_id)
                if (department) {
                    let lastTicket = await totalTIcket_Count(corporate_department_id, service_id)
                    let ticketNo = parseInt(lastTicket) + 1;
                    let newOrder = await Corporate_Panel_Orders.create({
                        user_id: req.user.id,
                        employee_id: null,
                        department_id: corporate_department_id,
                        corporate_id: department.corporate_panel_id,
                        service_id: service_id,
                        ticket_no: parseInt(ticketNo),
                        ticket_type: parseInt(1),
                        status: 'waiting',
                        in_waiting: new Date()
                    });
                    if (newOrder) {
                        res.status(200).json({
                            status: 200,
                            message: 'new order placed',
                            order: newOrder
                        })
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: 'Error while assigning ticket'
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 200,
                        message: "Error while fetching department"
                    })
                }
            }
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
exports.checkIfCustomerExistsInQueue = async (req, res, next) => {
    try {
        let record = await Corporate_Panel_Orders.findAll(
            {
                limit: 1,
                where:
                {
                    user_id: req.user.id,
                    createdAt: { [Op.gt]: new Date(moment().subtract(1, 'days')) }
                },
                order: [['createdAt', 'DESC']],
                raw: true
            });
        if (record.length > 0) {
            if (record[0].employee_id == null) {
                let service_id = record[0].service_id;
                if (service_id) {
                    let employees = await EmployeeModel.findAll({
                        limit: 1,
                        where: {
                            service_id: service_id,
                            status: 0,
                        },
                        raw: true
                    });
                    if (employees.length > 0) {
                        let updatedEmployee = await EmployeeModel.update({ status: 1 }, { where: { id: employees[0].id } });
                        if (updatedEmployee) {
                            let updatedTicket = await Corporate_Panel_Orders.update(
                                { status: 'working', in_working: new Date(), employee_id: employees[0].id },
                                {
                                    where:
                                    {
                                        id: record[0].id
                                    }
                                });
                            if (updatedTicket) {
                                res.status(200).json({
                                    status: 200,
                                    order: updatedTicket,
                                    employee: employees[0].name
                                })
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    order: record[0],
                                    employee: null
                                })
                            }
                        } else {
                            res.status(200).json({
                                status: 200,
                                order: record[0],
                                employee: null
                            })
                        }
                    } else {
                        let estimated_time = await estimatedTime(record[0], req.user);
                        console.log('-------------->')
                        res.status(200).json({
                            status: 200,
                            order: record[0],
                            estimated_time
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while processing"
                    })
                }
            } else {
                UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
                EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });

                let employee = await EmployeeModel.findOne({
                    where: {
                        id: record[0].employee_id
                    },
                    include: [{
                        model: UserModel
                    }],
                    raw: true
                });
                if (employee) {
                    res.status(200).json({
                        status: 200,
                        order: record[0],
                        employee: employee["user.name"]
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        order: null,
                        employee: []
                    })
                }
            }

        } else {
            res.status(200).json({
                status: 200,
                order: null,
                employee: []
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
exports.checkIfCustomerTicketExistsAlready = async (req, res, next) => {
    try {
        let record = await Corporate_Panel_Orders.findAll(
            {
                limit: 1,
                where:
                {
                    user_id: req.user.id,
                    status: { [Op.ne]: 'done' },
                    createdAt: { [Op.gt]: new Date(moment().subtract(1, 'days')) }
                },
                order: [['createdAt', 'DESC']]
            });
        if (record.length > 0) {
            res.status(200).json({
                status: 200,
                order: record[0].dataValues
            })
        } else {
            res.status(200).json({
                status: 200,
                order: null
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
exports.takeFeedBackAndRemarks = async (req, res, next) => {
    try {
        let { remarks, rating, ticket_id } = req.body;
        if (checkEmpty(remarks) || checkEmpty(rating)) {
            res.status(200).json({
                status: 200,
                message: 'Please provide all required fields'
            })
        } else {
            let updateTicket = await Corporate_Panel_Orders.update({ remarks, rating }, { where: { id: ticket_id } });
            if (updateTicket) {
                res.status(200).json({
                    status: 200,
                    message: 'Thanks for your feedback!'
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while saving feedback"
                })
            }
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
exports.averageTimesForServicesForAdmin = async (req, res, next) => {
    try {
        let { corporate_department_id, service_id, employee_id } = req.body;
        let service = await Corporate_Panel_Orders.findAll({
            where: {
                department_id: corporate_department_id,
                status: "done",
                service_id,
                employee_id
            }
        });
        let estimated_time_for_waiting = 0;

        if (service.length > 0) {
            let time_diff_for_waiting = []
            for (let i = 0; i < service.length; i++) {
                if (service[i].dataValues.in_waiting !== null && service[i].dataValues.in_waiting !== null) {
                    let time = await count_time_difference(service[i].dataValues.in_waiting, service[i].dataValues.in_working)
                    time_diff_for_waiting.push(time);
                }
            }

            // For waiting
            if (time_diff_for_waiting.length == 1) {
                estimated_time_for_waiting = time_diff_for_waiting[0];
            } else {
                estimated_time_for_waiting = _.mean(time_diff_for_waiting)
            }

            res.status(200).json({
                status: 200,
                estimated_time_for_waiting: Math.floor(estimated_time_for_waiting),
            })
        } else {
            res.status(200).json({
                status: 200,
                estimated_time_for_waiting: Math.floor(estimated_time_for_waiting),
                // estimated_time_for_serving: Math.floor(estimated_time_for_serving)
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
exports.averageTimesForServices = async (req, res, next) => {
    try {
        let { corporate_department_id, service_id, employee_id } = req.body;
        let queue = await Corporate_Panel_Orders.count({
            where: {
                department_id: corporate_department_id,
                status: { [Op.eq]: "waiting" },
                service_id,
                employee_id,
                user_id: { [Op.ne]: req.user.id }
            }
        });
        let service = await ServicesModel.findByPk(service_id);
        if (service) {
            let estimated_time_for_waiting = 0;
            if (queue > 0) {
                estimated_time_for_waiting = queue * service.estimated_time
                res.status(200).json({
                    status: 200,
                    estimated_time_for_waiting: estimated_time_for_waiting,

                })
            }
            else {
                res.status(200).json({
                    status: 200,
                    estimated_time_for_waiting: parseInt(estimated_time_for_waiting)
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Service not found with given ID"
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

// ------------------------ Insurance ------------------------
exports.assignNewInsurance = async (req, res, next) => {
    try {
        let insurance_number = 0;
        let last_number = await InsuranceModel.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']],
            raw: true
        });
        if (last_number.length > 0) {
            insurance_number = parseInt(last_number[0].insurance_number) + 1;
        }
        console.log(insurance_number)
        let newInsurance = await InsuranceModel.create({
            user_id: req.user.id,
            insurance_number
        });
        if (newInsurance) {
            res.status(200).json({
                status: 200,
                message: "Insurance was successfully assigned"
            })
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while processing, Please try again later",
            })
        }


    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            Error: err.message
        })
    }
}
exports.checkIfInsuranceExists = async (req, res, next) => {
    try {
        let { insurance } = req.body;
        let insurance_check = await InsuranceModel.findOne({
            where: {
                insurance_number: insurance,
                user_id: req.user.id
            }
        });
        if (insurance_check) {
            res.status(200).json({
                status: 200,
                message: "Insurance exists"
            })
        } else {
            res.status(200).json({
                status: 400,
                message: "Insurance not found!",
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            Error: err.message
        })
    }
}
// -------------------------Phone Number ------------------------
exports.checkIfPhoneExists = async (req, res, next) => {
    try {
        let { phone_number } = req.body;
        if (checkEmpty(phone_number)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let check = await UserModel.findOne({
                where: {
                    cell: phone_number
                }
            });
            if (check) {
                res.status(200).json({
                    status: 200,
                    message: "Phone Number exists",
                    name: check.dataValues.name,
                    phone: check.dataValues.cell
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Phone Number does not exist",
                })
            }
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

// ------------------------ Functions --------------------------------
let login = async (customer_name, customer_number, gender) => {
    try {
        const user = await UserModel.findOne({ where: { cell: customer_number } });
        if (user) {
            return user.dataValues
        } else {
            let user = await createNewUserWithCell(customer_number, customer_name, gender);
            if (user) {
                return user
            } else {
                return null
            }
        }
        // }
    } catch (err) {
        console.error(err);
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing"
        })
    }
}
let createNewUserWithCell = async (customer_number, customer_name, gender) => {
    const user = await UserModel.create({
        cell: customer_number,
        name: customer_name,
        role_id: 1,
        gender
    })

    if (user) {
        return user.dataValues
    }
    else
        return null;
}
let createNewUserWithEmail = async (customer_number, customer_password, customer_name) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(customer_password, salt);
    const user = await UserModel.create({
        email: customer_number,
        password: hash,
        name: customer_name,
        role_id: 1
    })

    if (user) {
        return user.dataValues
    }
    else
        return null;
}
let totalTIcket_Count = async (department_id, service_id) => {
    try {
        let allOrders = await Corporate_Panel_Orders.findAll({
            limit: 1,
            where:
            {
                department_id: department_id,
                service_id: service_id
            }, order: [['createdAt', 'DESC']]
        }
        );
        if (allOrders.length > 0) {
            return parseInt(allOrders[0].dataValues.ticket_no)
        } else {
            return 0
        }
    } catch (err) {
        console.error(err)
    }
}
let count_time_difference = async (date1, date2) => {
    let start = moment(new Date(date1));
    let end = moment(new Date(date2));
    let duration = moment.duration(end.diff(start));
    return duration.asMinutes()
}

let estimatedTime = async (record, user) => {
    let estimated_time = 0;
    let all_records = await Corporate_Panel_Orders.findAll({
        where: {
            corporate_id: record.corporate_id,
            service_id: record.service_id,
            department_id: record.department_id,
            in_working: { [Op.ne]: null },
            done_queue: { [Op.ne]: null }
        },
        raw: true
    });
    if (all_records.length > 0) {
        console.log(all_records[0])
        let total_customers_in_queue = await Corporate_Panel_Orders.count({
            where: {
                corporate_id: record.corporate_id,
                service_id: record.service_id,
                status: { [Op.eq]: 'waiting' },
            }
        });
        let all_times = []
        for (let i = 0; i < all_records.length; i++) {
            let diff = await count_time_difference(all_records[i].in_working, all_records[i].done_queue);
            all_times.push(diff);
        }
        let average_time = _.mean(all_times);
        return estimated_time = average_time * total_customers_in_queue
    } else {
        let service = await ServicesModel.findByPk(record.service_id);
        return estimated_time = service.estimated_time
    }
}