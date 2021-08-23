const checkEmpty = require("../../../middlewares/checkEmpty.mid");
const CorporatePanel = require("../../../models/Corporate_Panel.model");
const Corporate_panel_department = require("../../../models/Corporate_Panel_Departments.model");
const EmployeeModel = require("../../../models/Employee.model");
const RequestsModel = require("../../../models/Requests.model");
const UserModel = require("../../../models/User.model");
const bcrypt = require("bcrypt");
const accessToken = require("../../../middlewares/token.mid");
const { Op } = require("sequelize");
const Corporate_OrdersModel = require("../../../models/Corporate_Orders.model");
const _ = require("lodash");
const moment = require("moment");
const ServicesModel = require("../../../models/Services.model");
const io = require("socket.io")(4001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// -------------------- Corporate panel dashboard-----------

exports.corporateSuperAdminDashboard = async (req, res, next) => {
  try {
    let total_served = 0;
    let total_serving = 0;
    let total_in_queue = 0;
    let total_employees = 0;

    // Total analytics related to corporate
    let corporate = await CorporatePanel.findOne({
      where: { user_id: req.user.id },
    });
    if (corporate) {
      total_served = await customerDetails(corporate.dataValues.id, 1);
      total_serving = await customerDetails(corporate.dataValues.id, 2);
      total_in_queue = await customerDetails(corporate.dataValues.id, 3);

      // Total Employees
      total_employees = await EmployeeModel.count({
        where: { panel_id: req.user.id },
      });
      // Average Timings
      let service = await Corporate_OrdersModel.findAll({
        where: {
          corporate_id: corporate.dataValues.id,
          status: "cleared",
        },
      });
      let estimated_time_for_waiting = 0;
      let estimated_time_for_serving = 0;

      if (service.length > 0) {
        let time_diff_for_waiting = [];
        let time_diff_for_serving = [];
        for (let i = 0; i < service.length; i++) {
          if (
            service[i].dataValues.in_waiting !== null &&
            service[i].dataValues.in_working !== null
          ) {
            let time = await count_time_difference(
              service[i].dataValues.in_waiting,
              service[i].dataValues.in_working
            );
            time_diff_for_waiting.push(time);
          }
          if (
            service[i].dataValues.in_working !== null &&
            service[i].dataValues.done_queue !== null
          ) {
            let time = await count_time_difference(
              service[i].dataValues.in_working,
              service[i].dataValues.done_queue
            );
            time_diff_for_serving.push(time);
          }
        }
        if (time_diff_for_waiting.length == 1) {
          estimated_time_for_waiting = time_diff_for_waiting[0];
        } else {
          estimated_time_for_waiting = _.mean(time_diff_for_waiting);
        }
        if (time_diff_for_serving.length == 1) {
          estimated_time_for_serving = time_diff_for_serving[0];
        } else {
          estimated_time_for_serving = _.mean(time_diff_for_serving);
        }
      }
      if (total_employees == null || isNaN(total_employees)) {
        total_employees = 0;
      }
      if (
        estimated_time_for_waiting == null ||
        isNaN(estimated_time_for_waiting)
      ) {
        estimated_time_for_waiting = 0;
      }
      if (
        estimated_time_for_serving == null ||
        isNaN(estimated_time_for_serving)
      ) {
        estimated_time_for_serving = 0;
      }

      let averageFunction = await Corporate_OrdersModel.findAll({
        where: {
          corporate_id: corporate.dataValues.id,
          rating: { [Op.ne]: null },
        },
        attributes: [
          [sequelize.fn("AVG", sequelize.col("rating")), "avg_rating"],
        ],
        raw: true,
      });
      if (averageFunction[0].avg_rating == null) {
        averageFunction[0].avg_rating = 0;
      }

      res.status(200).json({
        status: 200,
        total_served: total_served.length,
        total_served_list: total_served,
        total_serving: total_serving.length,
        total_serving_list: total_serving,
        total_in_queue: total_in_queue.length,
        total_in_queue_list: total_in_queue,
        total_employees,
        estimated_time_for_waiting: estimated_time_for_waiting,
        estimated_time_for_serving: estimated_time_for_serving,
        average_rating: parseFloat(averageFunction[0].avg_rating),
      });
    } else {
      res.status(200).json({
        status: 400,
        message: "Error while fetching corporate data",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};

// -------------------- Corporate Panel --------------------
exports.corporateDetails = async (req, res, next) => {
  try {
    let request = await RequestsModel.findOne({
      where: { user_id: req.user.id },
    });
    if (request) {
      let corporate = await CorporatePanel.findOne({
        where: { user_id: req.user.id },
      });
      if (corporate) {
        res.status(200).json({
          status: 200,
          corporate_name: request.dataValues.company_name,
          corporate_type: request.dataValues.business_type_name,
          corporate_type_id: request.dataValues.business_type_id,
          corporate_email: req.user.email,
          corporate,
        });
      } else {
        res.status(200).json({
          status: 200,
          corporate_name: request.dataValues.company_name,
          corporate_type: request.dataValues.business_type_name,
          corporate_type_id: request.dataValues.business_type_id,
          corporate_email: req.user.email,
          corporate: [],
        });
      }
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
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.corporateDepartmentDetails = async (req, res, next) => {
  try {
    let { corporate_id, corporate_department_id } = req.body;
    if (checkEmpty(corporate_department_id) || checkEmpty(corporate_id)) {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    } else {
      let query = "  SELECT u.*, COUNT(e.id) AS COUNT FROM `employees` e";
      query += " LEFT JOIN `users` u ON u.id=e.user_id";
      query +=
        " WHERE ( e.panel_id=" +
        req.user.id +
        " AND corporate_panel_department_id=" +
        corporate_department_id +
        " AND u.role_id=2)";
      let query_2 =
        "  SELECT COUNT(id) AS COUNT FROM `services` WHERE corporate_panel_id=" +
        req.user.id +
        " AND department_id=" +
        corporate_department_id;
      let query_3 = " SELECT * FROM `employees` e";
      query_3 += " LEFT JOIN `users` u ON u.id=e.user_id";
      query_3 +=
        " WHERE e.corporate_panel_department_id=" + corporate_department_id;
      query_3 += " AND u.role_id=6";
      let employees = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });
      let services = await sequelize.query(query_2, {
        type: sequelize.QueryTypes.SELECT,
      });
      let manager = await sequelize.query(query_3, {
        type: sequelize.QueryTypes.SELECT,
      });
      // console.log(employees[0].COUNT)
      res.status(200).json({
        status: 200,
        employees: employees[0].COUNT,
        services: services[0].COUNT,
        total_served: 0,
        total_inQueue: 0,
        totalServing: 0,
        manager,
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.createCoporate = async (req, res, next) => {
  try {
    let { services, corporate_name } = req.body;
    if (services.length > 0) {
      let corporateCheck = await CorporatePanel.findOne({
        where: { user_id: req.user.id },
      });
      if (corporateCheck) {
        if (services.length > 0) {
          let failed = false;
          for (let i = 0; i < services.length; i++) {
            let newDepartment = await Corporate_panel_department.create({
              name: services[i],
              user_id: req.user.id,
              corporate_panel_id: corporateCheck.dataValues.id,
              parent_id: corporateCheck.dataValues.id,
            });
            if (newDepartment) {
              failed = false;
            } else {
              failed = true;
            }
          }
          if (failed) {
            res.status(200).json({
              status: 400,
              message: "Error while creating departments",
            });
          } else {
            res.status(200).json({
              status: 200,
              message: "Coporate details updated successfully",
              corporate_id: corporateCheck.dataValues.id,
            });
          }
        }
      } else {
        let corporate = await CorporatePanel.create({
          name: corporate_name,
          user_id: req.user.id,
        });
        if (corporate) {
          if (services.length > 0) {
            let failed = false;
            for (let i = 0; i < services.length; i++) {
              let newDepartment = await Corporate_panel_department.create({
                name: services[i],
                user_id: req.user.id,
                corporate_panel_id: corporate.dataValues.id,
                parent_id: corporate.dataValues.id,
              });
              if (newDepartment) {
                failed = false;
              } else {
                failed = true;
              }
            }
            if (failed) {
              res.status(200).json({
                status: 400,
                message: "Error while creating departments",
              });
            } else {
              res.status(200).json({
                status: 200,
                corporate_id: corporate.dataValues.id,
              });
            }
          }
        }
      }
    } else {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.createCoporateDepartment = async (req, res, next) => {
  try {
    let {
      name,
      description,
      corporate_id,
      manager_name,
      email,
      phone_number,
      address,
    } = req.body;
    if (
      checkEmpty(name) ||
      checkEmpty(corporate_id) ||
      checkEmpty(manager_name) ||
      checkEmpty(email) ||
      checkEmpty(phone_number) ||
      checkEmpty(address)
    ) {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    } else {
      let user = await checkIfUserExists(email, phone_number);
      if (user.user_exists) {
        res.status(200).json({
          status: 200,
          message: user.message,
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("11111111", salt);
        let new_user = await UserModel.create({
          name: manager_name,
          email: email,
          cell: phone_number,
          address: address,
          role_id: 6,
          password: hash,
        });
        if (new_user) {
          let corporateDepartment = await Corporate_panel_department.create({
            name,
            corporate_panel_id: corporate_id,
            image: req.file.path,
            user_id: req.user.id,
            parent_id: corporate_id,
            description,
          });
          if (corporateDepartment) {
            let manager_as_employee = await EmployeeModel.create({
              user_id: new_user.dataValues.id,
              panel_id: req.user.id,
              corporate_panel_department_id: corporateDepartment.dataValues.id,
            });
            if (manager_as_employee) {
              res.status(200).json({
                status: 200,
                message: "Corporate department updated successfully",
              });
            } else {
              res.status(200).json({
                status: 400,
                message: "Error while creating department",
              });
            }
          } else {
            res.status(200).json({
              status: 400,
              message: "Error while creating department",
            });
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while creating department",
          });
        }
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.viewCorporatePanelDepartments = async (req, res, next) => {
  try {
    let { corporate_id } = req.body;
    const corporatePanels = await Corporate_panel_department.findAll({
      where: { corporate_panel_id: corporate_id },
    });
    if (corporatePanels.length > 0) {
      res.status(200).json({
        status: 200,
        corporatePanels,
      });
    } else {
      res.status(200).json({
        status: 200,
        corporatePanels: [],
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.editCorporatePanelDetails = async (req, res, next) => {
  try {
    const { name, description, corporate_department_id } = req.body;
    if (checkEmpty(name) || checkEmpty(corporate_department_id)) {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    } else {
      let corporateDepartment = await Corporate_panel_department.findByPk(
        corporate_department_id
      );
      if (corporateDepartment) {
        if (req.file.path == undefined) {
          let update_corporate_department =
            await Corporate_panel_department.update(
              { name, description },
              {
                where: {
                  id: corporate_department_id,
                },
              }
            );
          if (update_corporate_department) {
            res.status(200).json({
              status: 200,
              message: "Corporate department updated successfully",
            });
          }
        } else {
          let update_corporate_department =
            await Corporate_panel_department.update(
              { name, description, image: req.file.path },
              {
                where: {
                  id: corporate_department_id,
                },
              }
            );
          if (update_corporate_department) {
            res.status(200).json({
              status: 200,
              message: "Corporate department updated successfully",
            });
          }
        }
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while updating!",
        });
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.viewDepartmentDetails = async (req, res, next) => {
  try {
    const { corporate_department_id } = req.body;
    let corporateDepartment = await Corporate_panel_department.findByPk(
      corporate_department_id
    );
    if (corporateDepartment) {
      res.status(200).json({
        status: 200,
        corporateDepartment,
      });
    } else {
      res.status(200).json({
        status: 400,
        corporateDepartment: {},
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.deleteCorporateDepartment = async (req, res, next) => {
  try {
    let { corporate_department_id } = req.body;
    if (checkEmpty(corporate_department_id)) {
      res.status(200).json({
        status: 409,
        message: "Please provide all the required fields",
      });
    } else {
      let departmnet = await Corporate_panel_department.findByPk(
        corporate_department_id
      );
      if (departmnet) {
        let deleteDepartment = await Corporate_panel_department.destroy({
          where: { id: corporate_department_id },
        });
        if (deleteDepartment) {
          res.status(200).json({
            status: 200,
            message: "Department deleted successfully",
          });
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while deleting Department",
          });
        }
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};
exports.loginForManager = async (req, res, next) => {
  try {
    let { user_email, user_password } = req.body;
    // user_email = "uzair@card.com"
    // user_password = "11111111"
    if (user_email.includes(".com")) {
      let user = await UserModel.findOne({ where: { email: user_email } });
      if (user) {
        let match = await bcrypt.compare(
          user_password,
          user.dataValues.password
        );
        if (match) {
          if (user.dataValues.role_id == 6 || user.dataValues.role_id == 2) {
            let token = await accessToken(user.dataValues);
            let employee = await EmployeeModel.findOne({
              where: { user_id: user.dataValues.id },
            });
            if (employee) {
              let corporate = await CorporatePanel.findOne({
                where: { user_id: employee.dataValues.panel_id },
              });
              if (corporate) {
                let corporate_department =
                  await Corporate_panel_department.findOne({
                    where: { corporate_panel_id: corporate.dataValues.id },
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
                    corporate_department_name:
                      corporate_department.dataValues.name,
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
        } else {
          res.status(200).json({
            status: 401,
            message: "Invalid credentials",
          });
        }
      }
    } else {
      let user = await UserModel.findOne({ where: { cell: user_email } });
      if (user) {
        let match = await bcrypt.compare(
          user_password,
          user.dataValues.password
        );
        if (match) {
          if (user.dataValues.role_id == 6) {
            let token = await accessToken(user);
            let employee = await EmployeeModel.findOne({
              where: { user_id: user.dataValues.id },
            });
            if (employee) {
              let corporate = await CorporatePanel.findOne({
                where: { user_id: employee.dataValues.panel_id },
              });
              if (corporate) {
                let corporate_department =
                  await Corporate_panel_department.findOne({
                    where: { corporate_panel_id: corporate.dataValues.id },
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
                    corporate_department_name:
                      corporate_department.dataValues.name,
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
        } else {
          res.status(200).json({
            status: 401,
            message: "Invalid credentials",
          });
        }
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
      error: err.message,
    });
  }
};

// ---------------------------Utility Functions----------------------------
let checkIfUserExists = async (email, cell) => {
  let exists = false;
  let user_email = await UserModel.findOne({ where: { email: email } });
  if (user_email) {
    exists = true;
    return {
      user_exists: true,
      message: "User already exists with this email",
    };
  } else {
    let user_cell = await UserModel.findOne({ where: { cell: cell } });
    console.log(email);
    if (user_cell) {
      exists = true;
      return {
        user_exists: true,
        message: "User already exists with this phone",
      };
    } else {
      return {
        user_exists: false,
      };
    }
  }
};
let count_time_difference = async (date1, date2) => {
  let start = moment(new Date(date1));
  let end = moment(new Date(date2));
  let duration = moment.duration(end.diff(start));
  return duration.asMinutes();
};
let customerDetails = async (corporate_id, status) => {
  UserModel.hasOne(Corporate_OrdersModel, { foreignKey: "user_id" });
  Corporate_OrdersModel.belongsTo(UserModel, { foreignKey: "user_id" });
  ServicesModel.hasOne(Corporate_OrdersModel, { foreignKey: "service_id" });
  Corporate_OrdersModel.belongsTo(ServicesModel, { foreignKey: "service_id" });
  EmployeeModel.hasOne(Corporate_OrdersModel, { foreignKey: "employee_id" });
  Corporate_OrdersModel.belongsTo(EmployeeModel, { foreignKey: "employee_id" });
  UserModel.hasOne(EmployeeModel, { foreignKey: "user_id" });
  EmployeeModel.belongsTo(UserModel, { foreignKey: "user_id" });
  // customersWaiting =
  if (status == 1) {
    let total_served = await Corporate_OrdersModel.findAll({
      where: {
        corporate_id,
        status: { [Op.eq]: "cleared" },
      },
      include: [
        {
          model: ServicesModel,
        },
        {
          model: UserModel,
        },
        {
          model: EmployeeModel,
          include: [
            {
              model: UserModel,
            },
          ],
        },
      ],
    });
    return total_served;
  } else if (status == 2) {
    let total_serving = await Corporate_OrdersModel.findAll({
      where: {
        corporate_id,
        status: { [Op.eq]: "working" },
      },
      include: [
        {
          model: ServicesModel,
        },
        {
          model: UserModel,
        },
        {
          model: EmployeeModel,
          include: [
            {
              model: UserModel,
            },
          ],
        },
      ],
    });
    return total_serving;
  } else if (status == 3) {
    let total_in_queue = await Corporate_OrdersModel.findAll({
      where: {
        corporate_id,
        status: { [Op.eq]: "waiting" },
      },
      include: [
        {
          model: ServicesModel,
        },
        {
          model: UserModel,
        },
        {
          model: EmployeeModel,
          include: [
            {
              model: UserModel,
            },
          ],
        },
      ],
    });
    return total_in_queue;
  }
};
