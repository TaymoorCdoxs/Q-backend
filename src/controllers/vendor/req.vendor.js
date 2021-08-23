const Request = require("../../../src/models/Requests.model");
const User = require("../../../src/models//User.model");
const checkEmpty = require("../../middlewares/checkEmpty.mid");
const BusinessType = require("../../../src/models/Business_type.model");
const bcrypt = require("bcrypt");
const Role = require("../../../src/models/Role.model");
const sendEmail = require("../../middlewares/mailer.mid");
const CorporatePanel = require("../../models/Corporate_Panel.model");
const email = require("../../middlewares/mailer.mid");

exports.registerVendor = async (req, res, next) => {
  try {
    let {
      business_type_id,
      company_name,
      branch_name,
      user_email,
      phone_number,
      description,
      manager_name,
      package_duration,
      package_start,
    } = req.body;
    business_type_id = parseInt(business_type_id);
    package_duration = parseInt(package_duration);
    if (checkEmpty(business_type_id) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide business type id",
      });
    } else if (checkEmpty(company_name) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide company name",
      });
    } else if (checkEmpty(branch_name) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide branch name",
      });
    } else if (checkEmpty(user_email) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide email",
      });
    } else if (checkEmpty(phone_number) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide phone_number",
      });
    } else if (checkEmpty(description) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide description",
      });
    } else if (checkEmpty(manager_name) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide user name",
      });
    } else if (checkEmpty(package_duration) === true) {
      res.status(200).json({
        status: 400,
        message: "Please provide package duration",
      });
    } else {
      // Create user
      let check_user = await User.findAll({ where: { email: user_email } });
      if (check_user.length > 0) {
        res.status(200).json({
          status: 400,
          message: "User with this email already exists",
        });
      } else {
        let business_type_name = await BusinessType.findAll({
          where: { id: business_type_id },
        });
        let role = await Role.findAll({
          where: { name: business_type_name[0].dataValues.name },
        });
        // console.log(role);
        if (business_type_name.length > 0) {
          let pass = "11111111";
          const salt = await bcrypt.genSalt(10);
          const hash = await bcrypt.hash(pass, salt);
          let user = await User.create({
            email: user_email,
            name: manager_name,
            cell: phone_number,
            password: hash,
            role_id: role[0].dataValues.id,
          });
          const business = await Request.create({
            business_type_id: business_type_id,
            company_name,
            branch_name,
            business_type_name: business_type_name[0].dataValues.name,
            description,
            package_duration: "6",
            package_start: new Date(),
            package_end: new Date(),
            // status: "Pending",
            status: 0,
            user_id: user.id,
          });

          res.status(200).json({
            status: 200,
            message: "Business Registered Successfully",
          });
        } else {
          res.status(200).json({
            status: 400,
            message: "Business type not found",
          });
        }
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while processing",
    });
  }
};
exports.viewPendingRequests = async (req, res, next) => {
  try {
    let requests = await Request.findAll({ where: { status: 0 } });
    res.status(200).json({
      status: 200,
      requests,
    });
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while fetching data",
    });
  }
};
exports.viewPendingRequestsById = async (req, res, next) => {
  try {
    let req_id = req.params.id;
    let request = await Request.findByPk(req_id);
    let manager = await User.findByPk(request.user_id);
    res.status(200).json({
      status: 200,
      request,
      manager,
    });
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while fetching data",
    });
  }
};
exports.approveRequestsForVendor = async (req, res, next) => {
  try {
    let req_id = req.params.id;
    let remarks = req.body.remarks;
    if (checkEmpty(remarks) === true) {
      res.status(200).json({
        status: 400,
        message: "Please give your remarks while approving request",
      });
    } else {
      let request_ = await Request.update(
        { status: 1, remarks: remarks },
        { where: { id: req_id } }
      );
      if (request_) {
        let request = await Request.findByPk(req_id);
        if (request) {
          let user = await User.findByPk(request.user_id);
          if (user) {
            var Password = "11111111";
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(Password, salt);
            let update_user = await User.update(
              { password: hash },
              { where: { id: req_id } }
            );
            if (update_user) {
              if (user.role_id == 3) {
                // For Restaurant
                let details_string = `Hello ${user.name}-${request.company_name}. \\n\\nCOngratulations! Your QHIDE account has been activated. \n\nLogin Details:\nEmail: ${user.email}\nPassword: ${Password}`;
                let subject = "QHIDE Membership";
                await email(subject, details_string, user.email);
                res.status(200).json({
                  status: 200,
                  message: "Request approved",
                });
              } else {
                await approveAndCreateCorporate(user, request, res);
              }
            } else {
              res.status(200).json({
                status: 400,
                message: "Error while approving request",
              });
            }
          } else {
            res.status(200).json({
              status: 400,
              message: "Error while approving request",
            });
          }
        } else {
          res.status(200).json({
            status: 400,
            message: "Error while approving request",
          });
        }
      } else {
        res.status(200).json({
          status: 400,
          message: "Error while approving request",
        });
      }
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while approving request",
    });
  }
};
exports.rejectRequestsForVendor = async (req, res, next) => {
  try {
    let req_id = req.params.id;
    let remarks = req.body.remarks;
    if (checkEmpty(remarks) === true) {
      res.status(200).json({
        status: 400,
        message: "Please give your remarks while rejecting request",
      });
    } else {
      let request_ = await Request.update(
        { status: 2, remarks: remarks },
        { where: { id: req_id } }
      );
      let request = await Request.findByPk(req_id);
      let user = await User.findByPk(request.user_id);
      let details_string = `Hello ${user.name}-${request.company_name}. \\n\\n . ${remarks}`;
      options = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "QHIDE membership",
        text: details_string,
      };
      sendEmail(options);
      res.status(200).json({
        status: 200,
        message: "Request rejected",
      });
    }
  } catch (err) {
    next(err);
    res.status(200).json({
      status: 400,
      message: "Error while rejecting request",
    });
  }
};
// ----------------------------- Functions --------------------------------
const approveAndCreateCorporate = async (user, request, res) => {
  let corporate = await CorporatePanel.create({
    name: request.dataValues.company_name,
    user_id: user.dataValues.id,
  });
  if (corporate) {
    res.status(200).json({
      status: 200,
      message: "Request approved",
    });
  } else {
    res.status(200).json({
      status: 400,
      message: "Error while approving request",
    });
  }
};
