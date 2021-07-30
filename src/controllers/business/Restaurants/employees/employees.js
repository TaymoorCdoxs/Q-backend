const Employee = require("../../../../models/Employee.model");
const User = require("../../../../models/User.model");
const Restaurant = require("../../../../models/Restaurant.model");
const Role = require("../../../../models/Role.model");
const checkEmpty = require("../../../../middlewares/checkEmpty.mid");
const RequestsModel = require("../../../../models/Requests.model");
const bcrypt = require("bcrypt");

exports.createEmployee = async (req, res, next) => {
  try {
    let { user_name, user_address, user_cell } = req.body;
    if (
      checkEmpty(user_name) === true ||
      checkEmpty(user_address) === true ||
      checkEmpty(user_cell) === true
    ) {
      res.status(200).json({
        status: 200,
        message: "Please provide all the required fields",
      });
    } else {
      let panel = await Restaurant.findOne({ where: { user_id: req.user.id } });

      if (panel) {
        let req_panel = await RequestsModel.findOne({
          where: { user_id: req.user.id },
        });
        console.log(req_panel.dataValues);
        if (req_panel) {
          let employees = await Employee.findAll({
            where: { panel_id: req.user.id },
          });
          if (employees.length > 0) {
            let company = req_panel.dataValues.company_name
              .split(" ")[0]
              .toLowerCase();
            var emp_email = `employee${employees.length}@${company}.com`;
            let role = await Role.findOne({ where: { name: "Employee" } });
            let pass = "11111111";
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(pass, salt);
            const user = await User.create({
              email: emp_email,
              address: user_address,
              cell: user_cell,
              name: user_name,
              password: hash,

              role_id: role.id,
            });
            if (user) {
              const employee = await Employee.create({
                user_id: user.id,
                status: 0,
                panel_id: req.user.id,
              });
              res.status(200).json({
                status: 200,
                message: "Employee created successfully",
              });
            } else {
              res.status(200).json({
                status: 400,
                message: "Error while creating employees",
              });
            }
          } else {
            res.status(200).json({
              status: 400,
              message: "Error while creating employees",
            });
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while creating employees",
          });
        }
      } else {
        next(err);
        res.status(200).json({
          status: 400,
          message: "Coorporate not found",
        });
      }
    }
  } catch (err) {
    next(err);
    await transaction.rollback();
    res.status(200).json({
      status: 400,
      message: "Error while creating employees",
    });
  }
};
exports.editEmployeeDetails = async (req, res, next) => {
  try {
    let { emp_id, user_email, user_name, user_phone, user_address } = req.body;
    let employee = await Employee.findOne({
      where: {
        id: emp_id,
      },
    });
    if (employee) {
      let get_user = await User.findByPk(employee.user_id);
      if (get_user) {
        if (get_user.email == user_email) {
          if (get_user.cell == user_phone) {
            let user = await get_user.update({
              name: user_name,
              email: user_email,
              cell: user_phone,
              address: user_address,
            });
            res.status(200).json({
              status: 200,
              message: "Employee details updated successfully",
            });
          } else {
            let check_phone = await User.findAll({
              where: { cell: user_phone },
            });
            if (check_phone.length > 0) {
              res.status(200).json({
                status: 400,
                message:
                  "Phone Number already taken, please select another phone number",
              });
            } else {
              let user = await get_user.update({
                name: user_name,
                email: user_email,
                cell: user_phone,
                address: user_address,
              });
              res.status(200).json({
                status: 200,
                message: "Employee details updated successfully",
              });
            }
          }
        } else {
          let check_email = await User.findAll({
            where: { email: user_email },
          });
          if (check_email.length > 0) {
            res.status(200).json({
              status: 400,
              message: "Email already taken, please select another Email",
            });
          } else {
            if (get_user.cell == user_phone) {
              let user = await get_user.update({
                name: user_name,
                email: user_email,
                cell: user_phone,
                address: user_address,
              });
              res.status(200).json({
                status: 200,
                message: "Employee details updated successfully",
              });
            } else {
              let check_phone = await User.findAll({
                where: { cell: user_phone },
              });
              if (check_phone.length > 0) {
                res.status(200).json({
                  status: 400,
                  message:
                    "Phone Number already taken, please select another phone number",
                });
              } else {
                let user = await get_user.update({
                  name: user_name,
                  email: user_email,
                  cell: user_phone,
                  address: user_address,
                });
                res.status(200).json({
                  status: 200,
                  message: "Employee details updated successfully",
                });
              }
            }
          }
        }
      } else {
        res.status(200).json({
          status: 400,
          message: "Employee Not found",
        });
      }
    } else {
      res.status(200).json({
        status: 200,
        message: "Employee not found",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while creating employees",
    });
  }
};
exports.deleteEmployeeDetails = async (req, res, next) => {
  try {
    let employee_id = req.body.emp_id;
    let employee = await Employee.findOne({
      where: {
        id: employee_id,
      },
    });
    if (employee) {
      let user = await User.destroy({
        where: {
          id: employee.user_id,
        },
      });
      let feature = await Employee.destroy({
        where: {
          id: employee.id,
        },
      });
      res.status(200).json({
        status: 200,
        message: "Employee deleted successfully",
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Employee not found",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while creating employees",
    });
  }
};
