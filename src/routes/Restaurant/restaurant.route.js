// const auth = require('../controllers/auth');
const express = require('express');
const { viewRestaurantDetails, saveRestaurantDetails, dashboard, viewEmployees } = require('../../controllers/business/Restaurants/restaurant');
const { mobileLoginForDineIn, mobileLoginForAppSide, checkIfOrderExistsAndAssignTableIfAvailable, saveDineInFeedBack, averageInQueueToDineInTime } = require('../../controllers/business/Restaurants/restaurant_dine_in/restaurant_dine_in');
const {
    addToCart,
    viewCart,
    updateQuantityInCart,
    deleteItemFromCart,
    confirmOrder,
    viewConfirmedOrder,
    viewOrdersInWaiting,
    viewOrdersOverall,
    OrderServed,
    OrderReadyForServing,
    proceedOrderForWorking,
    viewOrdersInWorking,
    viewOrdersReady,
    viewOrdersServed,
    orderRatingAndRemarks,
    viewCartForDineIn,
    restaurantEmployeeDashboard,
    averageWaitingTimes,
} = require('../../controllers/business/Restaurants/restaurant_take_away/restaurant_take_away');
const { protect } = require('../../middlewares/auth.mid');
const router = express.Router();

router.route('/').get(protect, viewRestaurantDetails);
router.route('/').post(protect, saveRestaurantDetails);
router.route('/dashboard').put(protect, dashboard);
router.route('/employees').get(protect, viewEmployees);


// take-aways
router.route('/cart').post(protect, addToCart);
router.route('/cart').get(protect, viewCart);
router.route('/cart/dine-in').put(protect, viewCartForDineIn);
router.route('/cart').put(protect, updateQuantityInCart);
router.route('/cart/remove').put(protect, deleteItemFromCart);
router.route('/cart/confirm').post(protect, confirmOrder);
router.route('/cart/order').get(protect, viewConfirmedOrder);
router.route('/customer/rate').put(protect, orderRatingAndRemarks);


// take-aways-for-employees
router.route('/employee/waiting/:restaurant_id').get(protect, viewOrdersInWaiting);
router.route('/employee/working/:restaurant_id').get(protect, viewOrdersInWorking);
router.route('/employee/ready/:restaurant_id').get(protect, viewOrdersReady);
router.route('/employee/served/:restaurant_id').get(protect, viewOrdersServed);
router.route('/employee/all-orders/:restaurant_id').get(protect, viewOrdersOverall);
router.route('/employee/working/:order_id').put(protect, proceedOrderForWorking);
router.route('/employee/ready/:order_id').put(protect, OrderReadyForServing);
router.route('/employee/served/:order_id').put(protect, OrderServed);
router.route('/employee/dashboard').get(protect, restaurantEmployeeDashboard);


// dine-in
router.route('/dine-in').post(mobileLoginForDineIn);
router.route('/dine-in/app').post(protect, mobileLoginForAppSide);
router.route('/dine-in/app').put(protect, checkIfOrderExistsAndAssignTableIfAvailable);
router.route('/dine-in/app/feedback').put(protect, saveDineInFeedBack);
router.route('/dine-in/estimate').put(protect, averageInQueueToDineInTime);
router.route('/take-away/estimate').put(averageWaitingTimes);


module.exports = router;