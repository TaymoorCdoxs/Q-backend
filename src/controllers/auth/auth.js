const bcrypt = require("bcrypt");
const User = require("../..//models/User.model");
const Role = require("../../models/Role.model");
const accessToken = require("../../middlewares/token.mid");
const checkEmpty = require("../../middlewares/checkEmpty.mid");
const Requests = require("../../models/Requests.model");
const RestaurantModel = require("../../models/Restaurant.model");
const EmployeeModel = require("../../models/Employee.model");
const RequestsModel = require("../../models/Requests.model");
const Business_type = require("../../models/Business_type.model");
let CorporatePanel = require("../../models/Corporate_Panel.model");
let Corporate_panel_department = require("../../models/Corporate_Panel_Departments.model");

// ------------------------ API's---------------------------
exports.register = async (req, res, next) => {
    try {
        if (req.params.status == 1) {
            let { user_email, user_name, user_password, confirmPass, role } =
                req.body;
            // console.log(req.body);
            if ((await checkEmpty(user_email)) === true) {
                res.status(200).json({
                    status: 400,
                    message: "Please provide an email address",
                });
            } else if ((await checkEmpty(user_email)) === true) {
                res.status(200).json({
                    status: 200,
                    message: "Please provide a valid username",
                });
            } else if ((await checkEmpty(user_password)) === true) {
                res.status(200).json({
                    status: 200,
                    message: "Please provide a valid password",
                });
            } else if ((await checkEmpty(confirmPass)) === true) {
                res.status(200).json({
                    status: 200,
                    message: "Please confirm your password",
                });
            } else {
                if (confirmPass !== user_password) {
                    res.status(200).json({
                        status: 200,
                        message: "Email already exists",
                    });
                } else {
                    const checkEmail = await User.findAll({
                        where: { email: user_email },
                    });
                    if (checkEmail.length > 0) {
                        res.status(200).json({
                            status: 400,
                            message: "Email already exists",
                        });
                    } else {
                        const salt = await bcrypt.genSalt(10);
                        const hash = await bcrypt.hash(user_password, salt);
                        const newUser = await User.create({
                            name: user_name,
                            email: user_email,
                            password: hash,
                            role_id: role,
                        });
                        res.status(200).json({
                            status: 200,
                            message: "User registered successfully",
                        });
                    }
                }
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while registering new user",
        });
    }
};
exports.login = async (req, res, next) => {
    try {
        const { user_email, user_password } = req.body;
        if (checkEmpty(user_email) === true || checkEmpty(user_password) === true) {
            res.status(200).json({
                status: 400,
                message: "Please provide an email address",
            });
        } else {
            const user = await User.findOne({ where: { email: user_email } });
            if (user) {
                let match = await bcrypt.compare(
                    user_password,
                    user.dataValues.password
                );
                if (match) {
                    switch (user.dataValues.role_id) {
                        case 0:
                            await loginForAdmin(user, res);
                            break;
                        case 1:
                            await loginForUser(user.dataValues, res);
                            break;
                        case 2:
                            await loginForEmployeeOfCorporate(user, res);
                            break;
                        case 3:
                            await loginForRestaurantAdmin(user, res);
                            break;
                        case 4:
                            await loginForHospitalAdmin(user, res);
                            break;
                        case 6:
                            await loginForManagerOfCorporateDepartment(user, res);
                            break;
                        case 7:
                            await loginForReceptionistOfCorporate(user, res);
                            break;
                        default:
                            res.status(200).json({
                                status: 401,
                                message: "Invalid credentials",
                            });
                    }
                } else {
                    res.status(200).json({
                        status: 401,
                        message: "Invalid credentials",
                    });
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Invalid credentials",
                });
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while logging in",
            error: err.message,
        });
    }
};
// -------------------------- functions --------------------

const loginForAdmin = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        let token = await accessToken(user.dataValues);
        res.status(200).json({
            status: 200,
            message: "Login successful",
            token: token,
            role: role.dataValues.name,
            user: user.dataValues,
        });
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const loginForUser = async (user, res) => {
    let role = await Role.findByPk(user.role_id);
    if (role) {
        let token = await accessToken(user);
        res.status(200).json({
            status: 200,
            message: "Login successful",
            token: token,
            role: role.name,
            user: user,
        })
    } else {
        res.status(200).json({
            status: 400,
            message: "Error while logging in",
            error: err.message
        })
    }
};
const loginForManagerOfCorporateDepartment = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        // console.log(role.dataValues);
        let token = await accessToken(user.dataValues);
        let employee = await EmployeeModel.findOne({
            where: { user_id: user.dataValues.id },
        });
        if (employee) {
            let corporate = await CorporatePanel.findOne({
                where: { user_id: employee.dataValues.panel_id },
            });
            if (corporate) {
                let corporate_department = await Corporate_panel_department.findOne({
                    where: { id: employee.dataValues.corporate_panel_department_id },
                });
                if (corporate_department) {
                    res.status(200).json({
                        status: 200,
                        message: "Login successful",
                        token: token,
                        user: user.dataValues,
                        corporate_id: corporate.dataValues.id,
                        corporate_name: corporate.dataValues.name,
                        corporate_department_id: corporate_department.dataValues.id,
                        corporate_department_name: corporate_department.dataValues.name,
                        role: role.dataValues.name,
                    });
                } else {
                    res.status(200).json({
                        status: 401,
                        message: "Invalid credentials",
                    });
                }
            } else {
                res.status(200).json({
                    status: 401,
                    message: "Invalid credentials",
                });
            }
        } else {
            res.status(200).json({
                status: 401,
                message: "Invalid credentials",
            });
        }
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const loginForEmployeeOfCorporate = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        let token = await accessToken(user.dataValues);
        let employee = await EmployeeModel.findOne({
            where: { user_id: user.dataValues.id },
        });
        // console.log(employee.dataValues)
        if (employee) {
            // if (employee.dataValues.corporate_panel_department_id) {
            // console.log(employee.dataValues)
            let corporate = await RequestsModel.findOne({
                where: { user_id: employee.dataValues.panel_id },
            });
            if (corporate) {
                let business = await Business_type.findByPk(
                    corporate.dataValues.business_type_id
                );
                if (business) {
                    if (business.dataValues.id == 3) {
                        let restaurant = await RestaurantModel.findOne({
                            where: { user_id: employee.panel_id },
                        });
                        let business_name = snakeCase(business.name);
                        res.status(200).json({
                            status: 200,
                            message: "Login successful",
                            token: token,
                            role: role.dataValues.name,
                            corporate: { business_name, id: business.id },
                            corporate_id: restaurant.id,
                            user: user.dataValues,
                            business_type_id: business.id,
                        });
                    } else {
                        let corporate_department =
                            await Corporate_panel_department.findOne({
                                where: { id: employee.dataValues.corporate_panel_department_id },
                            });
                        console.log(corporate_department)
                        if (corporate_department) {
                            res.status(200).json({
                                status: 200,
                                message: "Login successful",
                                token: token,
                                user: user.dataValues,
                                corporate_id: corporate.dataValues.id,
                                corporate_name: corporate.dataValues.name,
                                corporate_department_id: corporate_department.dataValues.id,
                                corporate_department_name: corporate_department.dataValues.name,
                                role: role.dataValues.name,
                                business_type_id: business.id,
                            });
                        } else {
                            res.status(200).json({
                                status: 401,
                                message: "Invalid credentials",
                            });
                        }
                    }
                } else {
                    res.status(200).json({
                        status: 401,
                        message: "Invalid credentials",
                    });
                }
            } else {
                res.status(200).json({
                    status: 401,
                    message: "Invalid credentials",
                });
            }
            // } else {
            //     let corporate = await CorporatePanel.findOne({
            //         where: { user_id: employee.dataValues.panel_id },
            //     });
            //     if (corporate) {
            //         let corporate_department = await Corporate_panel_department.findOne({
            //             where: { corporate_panel_id: corporate.dataValues.id },
            //         });
            //         if (corporate_department) {
            //             let business = await RequestsModel.findOne({
            //                 where: { user_id: corporate.dataValues.user_id },
            //             });
            //             // console.log(business);
            //             if (business) {
            //                 res.status(200).json({
            //                     status: 200,
            //                     message: "Login successful",
            //                     token: token,
            //                     user: user.dataValues,
            //                     corporate_id: corporate.dataValues.id,
            //                     corporate_name: corporate.dataValues.name,
            //                     corporate_department_id: corporate_department.dataValues.id,
            //                     corporate_department_name: corporate_department.dataValues.name,
            //                     role: role.dataValues.name,
            //                     business_type_id: business.dataValues.business_type_id,
            //                 });
            //             } else {
            //                 res.status(200).json({
            //                     status: 401,
            //                     message: "Invalid credentials",
            //                 });
            //             }
            //         } else {
            //             res.status(200).json({
            //                 status: 401,
            //                 message: "Invalid credentials",
            //             });
            //         }
            //     } else {
            //         res.status(200).json({
            //             status: 401,
            //             message: "Invalid credentials",
            //         });
            //     }
            // }
        } else {
            res.status(200).json({
                status: 401,
                message: "Invalid credentials",
            });
        }
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const loginForReceptionistOfCorporate = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        let token = await accessToken(user.dataValues);
        let employee = await EmployeeModel.findOne({
            where: { user_id: user.dataValues.id },
        });
        if (employee) {
            let corporate = await RequestsModel.findOne({
                where: { user_id: employee.dataValues.panel_id },
            });
            if (corporate) {
                let business = await Business_type.findByPk(
                    corporate.dataValues.business_type_id
                );
                if (business) {
                    if (business.dataValues.id == 3) {
                        let restaurant = await RestaurantModel.findOne({
                            where: { user_id: employee.panel_id },
                        });
                        let business_name = snakeCase(business.name);
                        res.status(200).json({
                            status: 200,
                            message: "Login successful",
                            token: token,
                            role: role.dataValues.name,
                            corporate: { business_name, id: business.id },
                            corporate_id: restaurant.id,
                            user: user.dataValues,
                            business_type_id: business.id,
                        });
                    } else {
                        let corporate_department =
                            await Corporate_panel_department.findOne({
                                where: { id: employee.dataValues.corporate_panel_department_id },
                            });
                        console.log(corporate_department)
                        if (corporate_department) {
                            res.status(200).json({
                                status: 200,
                                message: "Login successful",
                                token: token,
                                user: user.dataValues,
                                corporate_id: corporate.dataValues.id,
                                corporate_name: corporate.dataValues.name,
                                corporate_department_id: corporate_department.dataValues.id,
                                corporate_department_name: corporate_department.dataValues.name,
                                role: role.dataValues.name,
                                business_type_id: business.id,
                            });
                        } else {
                            res.status(200).json({
                                status: 401,
                                message: "Invalid credentials",
                            });
                        }
                    }
                } else {
                    res.status(200).json({
                        status: 401,
                        message: "Invalid credentials",
                    });
                }
            } else {
                res.status(200).json({
                    status: 401,
                    message: "Invalid credentials",
                });
            }
        } else {
            res.status(200).json({
                status: 401,
                message: "Invalid credentials",
            });
        }
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const loginForRestaurantAdmin = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        let token = await accessToken(user.dataValues);
        let requests = await Requests.findAll({
            where: { user_id: user.dataValues.id },
        });
        if (requests[0].dataValues.status == 1) {
            let restaurant = await RestaurantModel.findOne({
                where: { user_id: user.dataValues.id },
            });
            if (restaurant) {
                res.status(200).json({
                    status: 200,
                    message: "Login successful",
                    token: token,
                    role: role.dataValues.name,
                    user: user.dataValues,
                    corporate_id: restaurant.dataValues.id,
                });
            } else {
                res.status(200).json({
                    status: 200,
                    role: role.name,
                    user: user.dataValues,
                    message: "Login successful",
                    token: token,
                    corporate_id: null,
                });
            }
        } else if (requests[0].dataValues.status == 2) {
            res.status(200).json({
                status: 401,
                message: "Your request rejected",
                remarks: requests[0].dataValues.remarks,
            });
        } else {
            res.status(200).json({
                status: 401,
                message: "Your request is still pending",
            });
        }
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const loginForHospitalAdmin = async (user, res) => {
    let role = await Role.findByPk(user.dataValues.role_id);
    if (role) {
        let token = await accessToken(user.dataValues);
        let requests = await Requests.findAll({
            where: { user_id: user.dataValues.id },
        });
        if (requests[0].dataValues.status == 1) {
            let corporate_panel = await CorporatePanel.findOne({
                where: { user_id: user.dataValues.id },
            });
            if (corporate_panel) {
                let token = await accessToken(user.dataValues);
                res.status(200).json({
                    status: 200,
                    message: "Login successful",
                    token: token,
                    role: role.dataValues.name,
                    user: user.dataValues,
                    corporate_id: corporate_panel.dataValues.id,
                });
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Login successful",
                    token: token,
                    role: role.dataValues.name,
                    user: user.dataValues,
                    corporate_id: null,
                });
            }
        } else if (requests[0].dataValues.status == 2) {
            res.status(200).json({
                status: 401,
                message: "Your request rejected",
                remarks: requests[0].dataValues.remarks,
            });
        } else {
            res.status(200).json({
                status: 401,
                message: "Your request is still pending",
            });
        }
    } else {
        res.status(200).json({
            status: 401,
            message: "Invalid credentials",
        });
    }
};
const snakeCase = (string) => {
    return string
        .replace(/\W+/g, " ")
        .split(/ |\B(?=[A-Z])/)
        .map((word) => word.toLowerCase())
        .join("_");
};
