// const auth = require('../controllers/auth');
const express = require('express');
let UploadFIle = require('../../middlewares/departmentIcon')
let uploadServiceImage = require('../../middlewares/uploadServiceImage');
let UploadProfileImage = require('../../middlewares/uploadProfileImage.mid');
const { corporateDetails, createCoporate, viewCorporatePanelDepartments, editCorporatePanelDetails, createCoporateDepartment, corporateDepartmentDetails, loginForManager, corporateSuperAdminDashboard } = require('../../controllers/business/Corporate/corporate_panel');
const { protect } = require('../../middlewares/auth.mid');
const { createCorporateEmployees, editCorporateEmployees, viewCorporateEmployees, deleteCorporateEmployees, customersInQueue, customersServed, customersInServing, moveCustomerToWorking, moveCustomerToServed } = require('../../controllers/business/Employees/employees');
const { createCorporateServices, viewCorporateServices, editCorporateServices, deleteCorporateServices } = require('../../controllers/business/Departments/services');
const { departmentManagerDashboard } = require('../../controllers/business/Corporate/department_manager');
const { customerLoginForCorporate, viewCurrentCustomersInQueue, assignTicket, checkIfCustomerExistsInQueue, takeFeedBackAndRemarks, checkIfCustomerTicketExistsAlready, averageTimesForServices, assignNewInsurance, checkIfInsuranceExists, checkIfPhoneExists } = require('../../controllers/business/Corporate/customers');
const { createReceptionist, viewReceptionistById, viewReceptionist, editReceptionist, deleteReceptionist, receptionistDashboard, forwardCustomerForNextService, clearOrder, currentOrder } = require('../../controllers/business/Corporate/receptionist');
const router = express.Router();

// -------------------------Corporate Manager(Owner/Admin) Dashboard-------------
router.route('/dashboard').get(protect, corporateSuperAdminDashboard);

// --------------------------Corporate Panel & Departments------------------------
router.route('/').get(protect, corporateDetails);
router.route('/').put(protect, corporateDepartmentDetails);
router.route('/').post(protect, createCoporate);
router.route('/panels').put(protect, viewCorporatePanelDepartments);
router.route('/panels/update').put(protect, UploadFIle.single("icon"), editCorporatePanelDetails);
router.route('/panels').post(protect, UploadFIle.single("icon"), createCoporateDepartment);
router.route('/panels/login').post(protect, loginForManager);


// -------------------------- Dashboards ------------------------
router.route('/department/manager/dashboard').put(protect, departmentManagerDashboard);


// --------------------------Employees In Coporate------------------------
router.route('/employees').post(protect, createCorporateEmployees);
router.route('/employees').put(protect, editCorporateEmployees);
router.route('/employees/all').put(protect, viewCorporateEmployees);
router.route('/employees/remove').put(protect, deleteCorporateEmployees);



// --------------------------Services Routes-------------------------------
router.route('/services').post(protect, uploadServiceImage.single('icon'), createCorporateServices);
router.route('/services').put(protect, viewCorporateServices);
router.route('/services/update').put(protect, editCorporateServices);
router.route('/services/remove').put(protect, deleteCorporateServices);
module.exports = router;

// ---------------------------For Customer-------------------------------
router.route('/customer').post(customerLoginForCorporate);
router.route('/customer/details').put(protect, viewCurrentCustomersInQueue);
router.route('/customer/ticket').post(protect, assignTicket);
router.route('/customer').get(protect, checkIfCustomerExistsInQueue);
router.route('/customer/check-ticket').get(protect, checkIfCustomerTicketExistsAlready);
router.route('/customer/feedback').post(protect, takeFeedBackAndRemarks);
router.route('/customer/estimate').put(protect, averageTimesForServices);
router.route('/customer/insurance').post(protect, assignNewInsurance);
router.route('/customer/insurance').put(protect, checkIfInsuranceExists);
router.route('/customer/phone-number').put(checkIfPhoneExists);


// ---------------------------For Doctors/Employees-----------------------------------
router.route('/customers/waiting').get(protect, customersInQueue);
router.route('/customers/served').get(protect, customersServed);
router.route('/customers/working').get(protect, customersInServing);
router.route('/customers/working').put(protect, moveCustomerToWorking);
router.route('/customers/served').put(protect, moveCustomerToServed);
// router.route('/customers/checked-out').put(protect, moveCustomerToServed);

// --------------------------- Receptionist --------------------------------
router.route('/receptionist').post(protect, UploadProfileImage.single('image'), createReceptionist);
router.route('/receptionist').put(protect, viewReceptionist);
router.route('/receptionist/update').put(protect, UploadProfileImage.single('image'), editReceptionist);
router.route('/receptionist/delete').put(protect, deleteReceptionist);
router.route('/receptionist/dashboard').put(protect, receptionistDashboard);
router.route('/receptionist/forward').put(protect, forwardCustomerForNextService);
router.route('/receptionist/order/clear').put(protect, clearOrder);
router.route('/receptionist/current').put(currentOrder);


module.exports = router;