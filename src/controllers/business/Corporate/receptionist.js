const UserModel = require("../../../models/User.model");
const EmployeeModel = require("../../../models/Employee.model");
const CorporatePanel = require("../../../models/Corporate_Panel.model");
const checkEmpty = require('../../../middlewares/checkEmpty.mid');
const fs = require('fs');
const Corporate_OrdersModel = require("../../../models/Corporate_Orders.model");
const bcrypt = require('bcrypt');
const ServicesModel = require("../../../models/Services.model");
const { Op } = require('sequelize');
let moment = require('moment');
const e = require("express");

exports.createReceptionist = async (req, res, next) => {
    try {
        let { name, email, phone, address, gender, education, department_id, corporate_id } = req.body;
        if (checkEmpty(name) || checkEmpty(email) || checkEmpty(phone) || checkEmpty(address) || checkEmpty(gender)
            || checkEmpty(education) || checkEmpty(department_id) || checkEmpty(corporate_id) || checkEmpty(req.file)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let checkPhone = await UserModel.findOne({ where: { cell: phone } });
            if (checkPhone) {
                res.status(200).json({
                    status: 400,
                    message: "Phone Number already exists"
                })
            } else {
                let checkEmail = await UserModel.findOne({ where: { email } });
                if (checkEmail) {
                    res.status(200).json({
                        status: 400,
                        message: "Email already exists"
                    })
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash("11111111", salt);
                    let newUser = await UserModel.create({
                        name,
                        email,
                        cell: phone,
                        address,
                        password: hash,
                        gender,
                        role_id: 7,
                        image: req.file.path
                    });
                    if (newUser) {
                        let corporate = await CorporatePanel.findByPk(corporate_id);
                        if (corporate) {
                            let employee = await EmployeeModel.create({
                                education,
                                speciality: 'Receptionist',
                                panel_id: corporate.user_id,
                                corporate_panel_department_id: department_id,
                                user_id: newUser.dataValues.id
                            })
                            if (employee) {
                                res.status(200).json({
                                    status: 200,
                                    message: "Receptionist created successfully"
                                })
                            } else {
                                res.status(200).json({
                                    status: 400,
                                    message: "Error while processing"
                                })
                            }
                        } else {
                            res.status(200).json({
                                status: 400,
                                message: "Error while processing"
                            })
                        }
                    }
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
exports.viewReceptionistById = async (req, res, next) => {
    try {
        let user = await UserModel.findByPk(req.user.id);
        res.status(200).json({
            status: 200,
            user
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing",
            error: err.message
        })
    }
}
exports.viewReceptionist = async (req, res, next) => {
    try {
        let { department_id, corporate_id } = req.body;
        if (checkEmpty(department_id) || checkEmpty(corporate_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } {
            let corporate = await CorporatePanel.findByPk(corporate_id);
            if (corporate) {
                UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
                EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
                let user = await UserModel.findOne({
                    where: {
                        role_id: 7,
                    },
                    include: [{
                        model: EmployeeModel,
                        where: {
                            panel_id: corporate.user_id,
                            corporate_panel_department_id: department_id,
                        }
                    }],
                    raw: true
                });
                if (user) {
                    res.status(200).json({
                        status: 200,
                        user
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        user: {}
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing"
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
exports.editReceptionist = async (req, res, next) => {
    try {
        // console.log(req.body)
        let { name, email, phone, address, gender, education, department_id, corporate_id, user_id, speciality } = req.body;
        if (checkEmpty(name) || checkEmpty(email) || checkEmpty(phone) || checkEmpty(address) || checkEmpty(gender)
            || checkEmpty(education) || checkEmpty(speciality) || checkEmpty(department_id) || checkEmpty(corporate_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let user = await UserModel.findByPk(user_id);
            if (user) {
                let update;
                if (req.file == null || req.file == undefined) {
                    update = await UserModel.update({ name, email, cell: phone, address, gender }, {
                        where: {
                            id: user.id
                        }
                    });
                } else {
                    try {
                        let path = user.image
                        if (path == null || path == undefined) {
                            update = await UserModel.update({ name, email, cell: phone, address, gender, image: req.file.path }, {
                                where: {
                                    id: user.id
                                }
                            });
                        } else {
                            if (fs.existsSync(path)) {
                                let unlinked = await fs.unlinkSync(path);
                                if (unlinked) {
                                    update = await UserModel.update({ name, email, cell: phone, address, gender, image: req.file.path }, {
                                        where: {
                                            id: user.id
                                        }
                                    });
                                } else {
                                    update = await UserModel.update({ name, email, cell: phone, address, gender, image: req.file.path }, {
                                        where: {
                                            id: user.id
                                        }
                                    });
                                }
                            } else {
                                update = await UserModel.update({ name, email, cell: phone, address, gender, image: req.file.path }, {
                                    where: {
                                        id: user.id
                                    }
                                });
                            }
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
                if (update) {
                    let employee = await EmployeeModel.findOne({ where: { user_id: user.id } });
                    if (employee) {
                        let corporate = await CorporatePanel.findByPk(corporate_id);
                        if (corporate) {
                            let updateEmp = await EmployeeModel.update({
                                education,
                                speciality,
                                corporate_panel_department_id: department_id,
                                panel_id: corporate.user_id
                            }, {
                                where: {
                                    id: employee.id
                                }
                            })
                            if (updateEmp) {
                                res.status(200).json({
                                    status: 200,
                                    message: "Details updated successfully"
                                })
                            } else {
                                res.status(200).json({
                                    status: 400,
                                    message: "Error while processing"
                                })
                            }
                        } else {
                            res.status(200).json({
                                status: 400,
                                message: "Error while processing"
                            })
                        }
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: "Error while processing"
                        })
                    }

                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while processing"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing"
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
exports.deleteReceptionist = async (req, res, next) => {
    try {
        let { employee_id, user_id } = req.body;
        let user = await UserModel.findByPk(user_id);
        if (user) {
            let employee = await EmployeeModel.findByPk(employee_id);
            if (employee) {
                let deleteEmployee = await EmployeeModel.destroy({
                    where: {
                        id: employee.id
                    }
                });
                if (deleteEmployee) {
                    let path;
                    if (user.image == null || user.image) {
                        //
                    } else {
                        path = user.image
                        if (fs.existsSync(path)) {
                            await fs.unlinkSync(path);
                        }
                    }
                    let deleteUser = await UserModel.destroy({ where: { id: user.id } });
                    if (deleteUser) {
                        res.status(200).json({
                            status: 200,
                            message: "Receptionist deleted successfully"
                        })
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: "Error while processing"
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while processing"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while processing"
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
exports.receptionistDashboard = async (req, res, next) => {
    try {
        let { corporate_id } = req.body;
        let corporate = await CorporatePanel.findByPk(corporate_id);
        if (corporate) {
            let employee = await EmployeeModel.findOne({ where: { user_id: req.user.id } });
            if (employee) {
                let manualCustomers = 0;
                let customersWaiting = 0;
                let customersWorking = 0;
                let customersServed = 0;
                let customersCleared = 0;
                let department_id = employee.dataValues.corporate_panel_department_id
                if (department_id == null || department_id == undefined) {
                    res.status(200).json({
                        status: 400,
                        message: "Error while processing"
                    })
                } else {
                    UserModel.hasOne(Corporate_OrdersModel, { foreignKey: 'user_id' });
                    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: 'user_id' });
                    ServicesModel.hasOne(Corporate_OrdersModel, { foreignKey: 'service_id' });
                    Corporate_OrdersModel.belongsTo(ServicesModel, { foreignKey: 'service_id' });
                    EmployeeModel.hasOne(Corporate_OrdersModel, { foreignKey: 'employee_id' });
                    Corporate_OrdersModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });
                    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
                    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
                    manualCustomers = await Corporate_OrdersModel.findAll({
                        where: {
                            department_id,
                            corporate_id,
                            status: { [Op.eq]: 'working' },
                            ticket_type: 1,
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
                    customersWaiting = await Corporate_OrdersModel.findAll({
                        where: {
                            department_id,
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
                    customersWorking = await Corporate_OrdersModel.findAll({
                        where: {
                            department_id,
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
                    customersServed = await Corporate_OrdersModel.findAll({
                        where: {
                            department_id,
                            corporate_id,
                            status: { [Op.eq]: 'done' }
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
                    customersCleared = await Corporate_OrdersModel.findAll({
                        where: {
                            department_id,
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
                    if (customersServed == null) {
                        customersServed = []
                    }
                    if (customersWorking == null) {
                        customersWorking = []
                    }
                    if (customersWaiting == null) {
                        customersWaiting = []
                    }

                    let total_tickets_assigned = await Corporate_OrdersModel.count({
                        where: {
                            department_id
                        }
                    })

                    if (total_tickets_assigned == null) {
                        total_tickets_assigned = 0
                    }

                    res.status(200).json({
                        status: 200,
                        customersServed,
                        customersWorking,
                        customersWaiting,
                        total_tickets_assigned,
                        customersCleared,
                        manualCustomers
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while processing"
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
exports.forwardCustomerForNextService = async (req, res, next) => {
    try {
        let { user_id, department_id, service_id, corporate_id, order_id } = req.body;
        let previousOrderOfUser = await Corporate_OrdersModel.findByPk(order_id);
        if (previousOrderOfUser) {
            let updatePreviousOrder = await Corporate_OrdersModel.update({ status: 'cleared', cleared_at: new Date() },
                {
                    where: { id: order_id }
                });
            if (updatePreviousOrder) {
                let ticket_no = await getTicketNo(department_id, corporate_id, service_id)
                if (ticket_no == null) {
                    res.status(200).json({
                        status: 400,
                        message: "Error while processing"
                    })
                } else {
                    newOrderInNextService = await Corporate_OrdersModel.create({
                        user_id,
                        department_id,
                        corporate_id,
                        service_id,
                        ticket_no,
                        ticket_type: 0,
                        status: 'waiting',
                        in_waiting: new Date()
                    })
                    if (newOrderInNextService) {
                        res.status(200).json({
                            status: 200,
                            message: 'Forwarded successfully'
                        })
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: 'Error while processing'
                        })
                    }
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Error while processing'
                })
            }
        } else {
            console.log('hereee')
            res.status(200).json({
                status: 400,
                message: 'Error while processing'
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
exports.clearOrder = async (req, res, next) => {
    try {
        let { order_id } = req.body;
        let order = await Corporate_OrdersModel.findByPk(order_id);
        if (order) {
            let updateOrder = await Corporate_OrdersModel.update({ status: 'cleared', cleared_at: new Date() }, {
                where: {
                    id: order_id
                }
            });
            if (updateOrder) {
                res.status(200).json({
                    status: 200,
                    message: "Order cleared successfully"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while processing"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while processing',
            error: err.message
        })
    }
}
exports.currentOrder = async (req, res, next) => {
    try {
        let { corporate_id, department_id } = req.body;
        let current_order = await Corporate_OrdersModel.findOne({
            where: {
                corporate_id,
                department_id,
                status: { [Op.eq]: 'waiting' }
            }
        });
        if (current_order) {
            if (current_order.ticket_type == 1) {
                let assignEmployeeManually = await assignEmployee(current_order);
                if (assignEmployeeManually == 0) {
                    res.status(200).json({
                        status: 200,
                        current_order: {}
                    })
                } else if (assignEmployeeManually == 1) {
                    UserModel.hasOne(Corporate_OrdersModel, { foreignKey: 'user_id' });
                    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: 'user_id' });
                    ServicesModel.hasOne(Corporate_OrdersModel, { foreignKey: 'service_id' });
                    Corporate_OrdersModel.belongsTo(ServicesModel, { foreignKey: 'service_id' });
                    EmployeeModel.hasOne(Corporate_OrdersModel, { foreignKey: 'employee_id' });
                    Corporate_OrdersModel.belongsTo(EmployeeModel, { foreignKey: 'employee_id' });
                    UserModel.hasOne(EmployeeModel, { foreignKey: 'user_id' });
                    EmployeeModel.belongsTo(UserModel, { foreignKey: 'user_id' });
                    let order = await Corporate_OrdersModel.findOne({
                        where: {
                            id: current_order.id
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
                    });
                    console.log(order)
                    res.status(200).json({
                        status: 200,
                        current_order: order
                    })
                } else if (assignEmployeeManually == 2) {
                    res.status(200).json({
                        status: 400,
                        message: "Error while manual ticket assigning"
                    })
                }
            } else {
                res.status(200).json({
                    status: 200,
                    current_order: {}
                })
            }
        } else {
            res.status(200).json({
                status: 200,
                current_order: {}
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while processing',
            error: err.message
        })
    }
}

// -------------------------- Utility functions ----------------------
let getTicketNo = async (department_id, corporate_id, service_id) => {
    try {
        let count = 0;
        let lastTicket = await Corporate_OrdersModel.findAll({
            limit: 1,
            where: {
                department_id,
                service_id,
                corporate_id
            },
            order: [['createdAt', 'DESC']]
        });
        if (lastTicket.length > 0) {
            count = parseInt(lastTicket[0].dataValues.ticket_no) + 1
            return count
        } else {
            return count
        }

    } catch (err) {
        return null
    }
}
let assignEmployee = async (order) => {
    let employee = await EmployeeModel.findOne({
        where: {
            status: 0,
            service_id: order.service_id,
            corporate_panel_department_id: order.department_id
        }
    });
    if (employee) {
        let update_order = await Corporate_OrdersModel.update({ status: 'working', in_working: new Date(), employee_id: employee.id },
            {
                where: {
                    id: order.id
                }
            });
        if (update_order) {
            let updateEmployee = await EmployeeModel.update({ status: 1 }, { where: { id: employee.id } });
            if (updateEmployee) {
                return 1
            } else {
                return 2
            }
        } else {
            return 2
        }
    } else {
        return 0
    }
}
