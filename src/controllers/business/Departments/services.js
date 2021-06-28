const checkEmpty = require('../../../middlewares/checkEmpty.mid');
const EmployeeModel = require('../../../models/Employee.model');
const Service = require('../../../models/Services.model');

// var bulk = require('node-bulk-sms');

// bulk.setUsername('Uzair');
// bulk.setPassword('Uzair40334');
// bulk.sendMessage('message', '+923049006895', function (result) {
//     console.log(result);
// });

exports.createCorporateServices = async (req, res, next) => {
    try {
        let { corporate_department_id, name, estimated_time, service_charges, description } = req.body;
        console.log(req.file)
        if (checkEmpty(name) || checkEmpty(corporate_department_id) || checkEmpty(description) || checkEmpty(service_charges) || checkEmpty(req.file.path)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let checkName = await Service.findOne({ where: { name: name, department_id: corporate_department_id } });
            if (checkName) {
                res.status(200).json({
                    status: 400,
                    message: "Service with same name already exists"
                })
            } else {
                if (req.user.role_id == 6) {
                    let employee = await EmployeeModel.findOne({ where: { user_id: req.user.id } });
                    if (employee) {
                        await createService(name, employee.dataValues.panel_id, corporate_department_id, description, estimated_time, service_charges, res, req.file.path)
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: "Error while creating service"
                        })
                    }
                } else if (req.user.role_id == 4) {
                    await createService(name, req.user.id, corporate_department_id, description, estimated_time, service_charges, res, req.file.path)
                }
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: err.message
        })
    }
}
exports.editCorporateServices = async (req, res, next) => {
    try {
        let { service_id, name, service_charges, description, estimated_time } = req.body;
        if (checkEmpty(name) || checkEmpty(description) || checkEmpty(service_charges)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let service = await Service.findByPk(service_id);
            if (service) {
                if (service.dataValues.name == name) {
                    let updateService = await Service.update({ name: name, service_charges: service_charges, description: description, estimated_time }, {
                        where: { id: service_id }
                    })
                    if (updateService) {
                        res.status(200).json({
                            status: 200,
                            message: "Service updated successfully"
                        })
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: "Error while updating service"
                        })
                    }
                } else {
                    let checkName = await Service.findOne({ where: { name: name, department_id: service.department_id } });
                    if (checkName) {
                        res.status(200).json({
                            status: 400,
                            message: "Service with same name already exists"
                        })
                    } else {
                        let updateService = await Service.update({ name: name, service_charges: service_charges, description: description }, {
                            where: { id: service_id }
                        })
                        if (updateService) {
                            res.status(200).json({
                                status: 200,
                                message: "Service updated successfully"
                            })
                        } else {
                            res.status(200).json({
                                status: 400,
                                message: "Error while updating service"
                            })
                        }
                    }
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while updating service"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: err.message
        })
    }
}
exports.deleteCorporateServices = async (req, res, next) => {
    try {
        let { service_id } = req.body;
        if (checkEmpty(service_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let deleteService = await Service.destroy({ where: { id: service_id } });
            if (deleteService) {
                res.status(200).json({
                    status: 200,
                    message: "Service deleted successfully"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while deleting service"
                })
            }
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: err.message
        })
    }
}
exports.viewCorporateServices = async (req, res, next) => {
    try {
        let { corporate_department_id } = req.body;
        console.log(req.body)
        if (checkEmpty(corporate_department_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let services = await Service.findAll({ where: { department_id: corporate_department_id } }, { type: sequelize.QueryTypes.SELECT })
            if (services.length > 0) {
                res.status(200).json({
                    status: 200,
                    services: services
                })
            } else {
                res.status(200).json({
                    status: 200,
                    services: []
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: err.message
        })
    }
}


// ----------------------------- Functions ----------------------------
let createService = async (name, corporate_panel_id, department_id, description, estimated_time, service_charges, res, path) => {
    try {
        let newService = await Service.create({
            name,
            corporate_panel_id: corporate_panel_id,
            department_id: department_id,
            status: 0,
            description,
            service_charges,
            estimated_time,
            ticket_id: null,
            image: path
        });

        if (newService) {
            res.status(200).json({
                status: 200,
                message: "New Service created successfully"
            })
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while creating service"
            })
        }
    } catch (err) {
        console.error(err)
    }
}