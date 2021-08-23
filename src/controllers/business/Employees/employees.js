const checkEmpty = require("../../../middlewares/checkEmpty.mid");
const CorporatePanel = require("../../../models/Corporate_Panel.model");
const EmployeeModel = require("../../../models/Employee.model");
const UserModel = require("../../../models/User.model");
const bcrypt = require("bcrypt");
const Corporate_OrdersModel = require("../../../models/Corporate_Orders.model");
const { Op } = require("sequelize");
let moment = require("moment");
const { emitUpdated } = require("../../../../config/socket");

exports.createCorporateEmployees = async (req, res, next) => {
  try {
    let { employee, corporate_id, corporate_department_id, service_id } =
      req.body;
    let corporate = await CorporatePanel.findByPk(corporate_id);
    if (corporate) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("11111111", salt);
      let checkUser = await UserModel.findOne({
        where: { email: employee.email },
      });
      if (checkUser) {
        res.status(200).json({
          status: 400,
          message: "User already exists with this email",
        });
      } else {
        let user = await UserModel.create({
          name: employee.name,
          email: employee.email,
          role_id: 2,
          cell: employee.phone_number,
          address: employee.address,
          password: hash,
          gender: employee.gender,
          status: 0,
        });
        if (user) {
          if (req.user.role_id == 6) {
            // console.log('as manager')
            let manager = await EmployeeModel.findOne({
              where: { user_id: req.user.id },
            });
            await creeateEmployee(
              user.dataValues,
              res,
              corporate_department_id,
              employee,
              manager.dataValues.panel_id,
              service_id
            );
          } else if (req.user.role_id == 4) {
            // console.log('as admin')
            await creeateEmployee(
              user.dataValues,
              res,
              corporate_department_id,
              employee,
              req.user.id,
              service_id
            );
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while creating employee",
          });
        }
      }
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while creating employee",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: err.message,
    });
  }
};
exports.editCorporateEmployees = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone_number,
      speciality,
      education,
      employee_id,
      max_allowed,
      service_id,
      gender,
    } = req.body;
    if (
      checkEmpty(name) ||
      checkEmpty(email) ||
      checkEmpty(speciality) ||
      checkEmpty(phone_number)
    ) {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    } else {
      let employee = await EmployeeModel.findByPk(employee_id);
      if (employee) {
        let user = await UserModel.findByPk(employee.dataValues.user_id);
        if (user) {
          if (user.dataValues.email == email) {
            if (user.dataValues.cell == phone_number) {
              let updateUser = await UserModel.update(
                { name, email: email, cell: phone_number, gender },
                {
                  where: { id: user.dataValues.id },
                }
              );
              if (updateUser) {
                let updateEmp = await EmployeeModel.update(
                  { education, speciality, max_allowed, service_id },
                  {
                    where: { id: employee.dataValues.id },
                  }
                );
                if (updateEmp) {
                  res.status(200).json({
                    status: 200,
                    message: "User details updated successfully",
                  });
                } else {
                  res.status(200).json({
                    status: 400,
                    message: "Error while updating employee",
                  });
                }
              } else {
                res.status(200).json({
                  status: 400,
                  message: "Error while updating employee",
                });
              }
            } else {
              let checkPhone = await UserModel.findAll({
                where: { cell: phone_number },
              });
              if (checkPhone.length > 0) {
                res.status(200).json({
                  status: 400,
                  message:
                    "Phone number already in use please select a different phone number",
                });
              } else {
                let updateUser = await UserModel.update(
                  { name: name, email: email, cell: phone_number, gender },
                  {
                    where: { id: user.dataValues.id },
                  }
                );
                if (updateUser) {
                  let updateEmp = await EmployeeModel.update(
                    { education, speciality, service_id, max_allowed },
                    {
                      where: { id: employee.dataValues.id },
                    }
                  );
                  if (updateEmp) {
                    res.status(200).json({
                      status: 200,
                      message: "User details updated successfully",
                    });
                  } else {
                    res.status(200).json({
                      status: 400,
                      message: "Error while updating employee",
                    });
                  }
                } else {
                  res.status(200).json({
                    status: 400,
                    message: "Error while updating employee",
                  });
                }
              }
            }
          } else {
            let checkEmail = await UserModel.findAll({
              where: { email: email },
            });
            if (checkEmail.length > 0) {
              res.status(200).json({
                status: 400,
                message:
                  "Email already exists, Please select a different email address",
              });
            } else {
              if (user.dataValues.cell == phone_number) {
                let updateUser = await UserModel.update(
                  { name: name, email: email, cell: phone_number, gender },
                  {
                    where: { id: user.dataValues.id },
                  }
                );
                if (updateUser) {
                  let updateEmp = await EmployeeModel.update(
                    { education, speciality, service_id },
                    {
                      where: { id: employee.dataValues.id },
                    }
                  );
                  if (updateEmp) {
                    res.status(200).json({
                      status: 200,
                      message: "User details updated successfully",
                    });
                  } else {
                    res.status(200).json({
                      status: 400,
                      message: "Error while updating employee",
                    });
                  }
                } else {
                  res.status(200).json({
                    status: 400,
                    message: "Error while updating employee",
                  });
                }
              } else {
                let checkPhone = await UserModel.findAll({
                  where: { cell: phone_number },
                });
                if (checkPhone.length > 0) {
                  res.status(200).json({
                    status: 400,
                    message:
                      "Phone number already in use please select a different phone number",
                  });
                } else {
                  let updateUser = await UserModel.update(
                    {
                      name: name,
                      email: email,
                      cell: phone_number,
                      education: education,
                    },
                    {
                      where: { id: user.dataValues.id },
                    }
                  );
                  if (updateUser) {
                    let updateEmp = await EmployeeModel.update(
                      { education, speciality, service_id },
                      {
                        where: { id: employee.dataValues.id },
                      }
                    );
                    if (updateEmp) {
                      res.status(200).json({
                        status: 200,
                        message: "User details updated successfully",
                      });
                    } else {
                      res.status(200).json({
                        status: 400,
                        message: "Error while updating employee",
                      });
                    }
                  } else {
                    res.status(200).json({
                      status: 400,
                      message: "Error while updating employee",
                    });
                  }
                }
              }
            }
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while updating employee",
          });
        }
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while updating employee",
        });
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: err.message,
    });
  }
};
exports.viewCorporateEmployees = async (req, res, next) => {
  try {
    const { corporate_department_id, service_id } = req.body;
    var query = "";
    if (process.env.DB === "mysql") {
      query =
        " SELECT e.id as id,  e.user_id as user_id, e.max_allowed,e.panel_id as panel_id, e.corporate_panel_department_id as corporate_panel_department_id, ";
      query +=
        " e.speciality as speciality, ser.name as service_name, ser.id as service_id,e.education as education , u.gender as gender,u.name as name, u.email as email, u.cell as cell, ";
      query +=
        " e.createdAt as createdAt, e.updatedAt as updatedAt , u.address as address , u.image as image, u.device_id  as device_id FROM `employees` e";
      query += " LEFT JOIN `users` u ON e.user_id=u.id ";
      query += " LEFT JOIN `services` ser ON ser.id=e.service_id ";
      query +=
        " WHERE (e.corporate_panel_department_id=" +
        corporate_department_id +
        " AND u.role_id=2)";
    } else if (process.env.DB === "mssql") {
      //In case of mssql
      query = `SELECT e.id as id,  e.user_id as user_id, e.max_allowed,e.panel_id as panel_id, e.corporate_panel_department_id as corporate_panel_department_id, e.speciality as speciality, ser.name as service_name, ser.id as service_id,e.education as education , u.gender as gender,u.name as name, u.email as email, u.cell as cell, e.createdAt as createdAt, e.updatedAt as updatedAt , u.address as address , u.image as image, u.device_id  as device_id FROM employees e LEFT JOIN users u ON e.user_id=u.id LEFT JOIN services ser ON ser.id=e.service_id WHERE (e.corporate_panel_department_id=${corporate_department_id} AND u.role_id=2)`;
    }

    let employees = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    // console.log(employees)
    if (employees.length > 0) {
      res.status(200).json({
        status: 200,
        employees,
      });
    } else {
      res.status(200).json({
        status: 200,
        employees: [],
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: err.message,
    });
  }
};
exports.deleteCorporateEmployees = async (req, res, next) => {
  try {
    const { employee_id } = req.body;
    let employee = await EmployeeModel.findByPk(employee_id);
    if (employee) {
      let user = await UserModel.findByPk(employee.dataValues.user_id);
      if (user) {
        let deleteUser = await UserModel.destroy({
          where: { id: employee.dataValues.user_id },
        });
        if (deleteUser) {
          let deleteEmployee = await EmployeeModel.destroy({
            where: { id: employee.dataValues.id },
          });
          if (deleteEmployee) {
            res.status(200).json({
              status: 200,
              message: "Employee deleted successfully",
            });
          } else {
            res.status(200).json({
              status: 400,
              message: "Error while deleting employee",
            });
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while deleting employee",
          });
        }
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while deleting employee",
        });
      }
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while deleting employee",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: err.message,
    });
  }
};

// -------------------------- For Doctors/Employees -------------------------
exports.customersInQueue = async (req, res, next) => {
  try {
    UserModel.hasMany(Corporate_OrdersModel, { foreignKey: "user_id" });
    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: "user_id" });

    let employee = await EmployeeModel.findOne({
      where: { user_id: req.user.id },
    });
    if (employee) {
      let queue = await Corporate_OrdersModel.findAll(
        {
          where: {
            employee_id: employee.dataValues.id,
            status: { [Op.eq]: "waiting" },
            createdAt: { [Op.gt]: new Date(moment().subtract(1, "days")) },
          },
          include: [
            {
              model: UserModel,
            },
          ],
        },
        { type: sequelize.QueryTypes.SELECT }
      );
      res.status(200).json({
        status: 200,
        queue,
      });
    } else {
      res.status(200).json({
        status: 200,
        queue: [],
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while fetching Data",
      error: err.message,
    });
  }
};
exports.customersServed = async (req, res, next) => {
  try {
    UserModel.hasMany(Corporate_OrdersModel, { foreignKey: "user_id" });
    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: "user_id" });
    let employee = await EmployeeModel.findOne({
      where: { user_id: req.user.id },
    });
    // console.log('served', req.user.id)
    if (employee) {
      let queue = await Corporate_OrdersModel.findAll(
        {
          where: {
            employee_id: employee.dataValues.id,
            status: { [Op.eq]: "cleared" },
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: UserModel,
            },
          ],
        },
        { type: sequelize.QueryTypes.SELECT }
      );
      updateNext(employee);
      res.status(200).json({
        status: 200,
        queue,
      });
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while fetching data",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while fetching Data",
      error: err.message,
    });
  }
};
updateNext = async (employee) => {
  var allWaitingOrders = await Corporate_OrdersModel.findAll({
    where: {
      status: { [Op.eq]: "waiting" },
      createdAt: {
        [Op.gt]: new Date().setHours(0, 0, 0, 0),
        [Op.lt]: new Date(),
      },
    },
    order: [["createdAt", "ASC"]],
  });
  if (allWaitingOrders.length > 0) {
    let service_id = employee.dataValues.service_id;
    var freeEmployees = await EmployeeModel.findOne({
      where: {
        service_id: service_id,
        status: { [Op.eq]: 0 },
      },
    });
    if (freeEmployees) {
      let onTop = allWaitingOrders[0].dataValues;
      // console.log(freeEmployees.dataValues);
      let updatedEmployee = await EmployeeModel.update(
        { status: 1 },
        { where: { id: freeEmployees.dataValues.id } }
      );
      if (updatedEmployee) {
        var updated = await Corporate_OrdersModel.update(
          {
            status: "working",
            in_working: new Date(),
            employee_id: freeEmployees.dataValues.id,
          },
          {
            where: {
              id: onTop.id,
            },
          }
        );
      }
    }
  }
};
exports.customersInServing = async (req, res, next) => {
  try {
    console.log("Ahahahah");
    UserModel.hasMany(Corporate_OrdersModel, { foreignKey: "user_id" });
    Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: "user_id" });

    let employee = await EmployeeModel.findOne({
      where: { user_id: req.user.id },
    });
    let current = await Corporate_OrdersModel.findAll(
      {
        where: {
          employee_id: employee.dataValues.id,
          status: { [Op.eq]: "working" },
          createdAt: { [Op.gt]: new Date(moment().subtract(1, "days")) },
        },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: UserModel,
          },
        ],
      },
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log(current);
    console.log(req.user.id);
    let next = await Corporate_OrdersModel.findAll(
      {
        limit: 1,
        where: {
          employee_id: employee.dataValues.id,
          status: { [Op.eq]: "waiting" },
          createdAt: { [Op.gt]: new Date(moment().subtract(1, "days")) },
        },
        include: [
          {
            model: UserModel,
          },
        ],
      },
      { type: sequelize.QueryTypes.SELECT }
    );
    res.status(200).json({
      status: 200,
      current,
      next,
    });
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while fetching Data",
      error: err.message,
    });
  }
};
exports.moveCustomerToWorking = async (req, res, next) => {
  try {
    let { order_id } = req.body;
    console.log(req.body);

    let order = await Corporate_OrdersModel.findByPk(order_id);
    if (order) {
      let updateTicket = await Corporate_OrdersModel.update(
        {
          status: "working",
          in_working: new Date(),
        },
        {
          where: {
            id: order_id,
          },
        }
      );
      if (updateTicket) {
        res.status(200).json({
          status: 200,
          message: "Serving customer now",
        });
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while processing ticket",
        });
      }
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while processing ticket",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing ticket",
      error: err.message,
    });
  }
};
exports.moveCustomerToServed = async (req, res, next) => {
  try {
    let { order_id } = req.body;
    let updateTicket = await Corporate_OrdersModel.update(
      {
        status: "done",
        done_queue: new Date(),
      },
      {
        where: {
          id: order_id,
        },
      }
    );
    if (updateTicket) {
      let updateEmployee = await EmployeeModel.update(
        { status: 0 },
        {
          where: {
            user_id: req.user.id,
          },
        }
      );
      if (updateEmployee) {
        console.log(
          "------------------------------............................"
        );
        emitUpdated(updateTicket);
        // appointNext();
        res.status(200).json({
          status: 200,
          message: "Customer Served",
        });
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while processing ticket",
        });
      }
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while processing ticket",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing ticket",
      error: err.message,
    });
  }
};
// exports.moveCustomerToServed = async (req, res, next) => {
//     try {
//         let { order_id } = req.body;
//         let updateTicket = await Corporate_OrdersModel.update({
//             status: 'checked-out',
//             done_queue: new Date()
//         }, {
//             where: {
//                 id: order_id
//             }
//         });
//         if (updateTicket) {
//             res.status(200).json({
//                 status: 200,
//                 message: "Customer checked-out"
//             })
//             // UserModel.hasMany(Corporate_OrdersModel, { foreignKey: 'user_id' });
//             // Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: 'user_id' });
//             // let employee = await EmployeeModel.findOne({ where: { user_id: req.user.id } });
//             // if (employee) {
//             //     let next = await Corporate_OrdersModel.findAll({
//             //         limit: 1,
//             //         where: {
//             //             employee_id: employee.dataValues.id,
//             //             status: { [Op.eq]: 'waiting' },
//             //             createdAt: { [Op.gt]: new Date(moment().subtract(1, 'days')) }
//             //         },
//             //         include: [{
//             //             model: UserModel
//             //         }]
//             //     }, { type: sequelize.QueryTypes.SELECT });
//             //     if (next.length > 0) {
//             //         let moveNextToServing = await Corporate_OrdersModel.update({ status: 'working' }, { where: { id: next[0].dataValues.id } });
//             //         if (moveNextToServing) {
//             //             res.status(200).json({
//             //                 status: 200,
//             //                 message: "Customer served"
//             //             })
//             //         } else {
//             //             res.status(200).json({
//             //                 status: 400,
//             //                 message: "Error while processing ticket"
//             //             })
//             //         }
//             //     } else {
//             //         res.status(200).json({
//             //             status: 200,
//             //             message: "Customer served"
//             //         })
//             //     }
//             // } else {
//             //     res.status(200).json({
//             //         status: 400,
//             //         message: "Error while processing ticket"
//             //     })
//             // }
//         } else {
//             res.status(200).json({
//                 status: 400,
//                 message: "Error while processing ticket"
//             })
//         }
//     } catch (err) {
//         next(err);
//         res.status(200).json({
//             status: 400,
//             message: "Error while processing ticket",
//             error: err.message
//         })
//     }
// }

// -------------------------- Functions ----------------------------

let creeateEmployee = async (
  user,
  res,
  corporate_department_id,
  employee,
  id,
  service_id
) => {
  try {
    let newEmployee = await EmployeeModel.create({
      user_id: user.id,
      panel_id: id,
      corporate_panel_department_id: corporate_department_id,
      speciality: employee.speciality,
      education: employee.education,
      max_allowed: employee.max_allowed,
      service_id,
    });
    if (newEmployee) {
      console.log(newEmployee);
      res.status(200).json({
        status: 200,
        message: "Employee added successfully",
      });
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while creating employee",
      });
    }
  } catch (err) {
    console.error(err);
  }
};
