const express = require('express');
const { viewEmployees, createEmployee, deleteEmployeeDetails, editEmployeeDetails } = require('../../controllers/business/Restaurants/employees/employees');
const {
    employeeDashBoardForDineIn,
    tablesDetailsForOccupied,
    tablesDetailsForUnOcupiedAndReady,
    cleanTable,
    tableEmptyToBeCleaned,
    addToCartOnDineIn,
    viewCart,
    tablesDetailsForOccupiedAndWorking,
    serveOrder,
    tablesDetailsForOccupiedAndServing,
    clearOrder,
    editOrder
} = require('../../controllers/business/Restaurants/restaurant_dine_in/restaurant_dine_in');
const { protect } = require('../../middlewares/auth.mid');
const router = express.Router();

router.route('/').post(protect, createEmployee);
router.route('/').put(protect, deleteEmployeeDetails);
router.route('/update').put(protect, editEmployeeDetails);


// Restaurant Dine In
router.route('/dine-in').get(protect, employeeDashBoardForDineIn);
router.route('/dine-in/occupied').put(protect, tablesDetailsForOccupied);
router.route('/dine-in/occupied-working').put(protect, tablesDetailsForOccupiedAndWorking);
router.route('/dine-in/occupied-serving').put(protect, tablesDetailsForOccupiedAndServing);
router.route('/dine-in/ready').put(protect, tablesDetailsForUnOcupiedAndReady);
router.route('/dine-in/clean').put(protect, tablesDetailsForOccupied);
router.route('/dine-in/table/clean').put(protect, cleanTable);
router.route('/dine-in/table/empty').put(protect, tableEmptyToBeCleaned);
router.route('/dine-in/cart').post(protect, addToCartOnDineIn);
router.route('/dine-in/cart').put(protect, viewCart);
router.route('/dine-in/cart-update').put(protect, editOrder);
router.route('/dine-in/order/serve').put(protect, serveOrder);
router.route('/dine-in/order/clear').put(protect, clearOrder);
// router.route('/dine-in/cart').post(protect, );
module.exports = router;