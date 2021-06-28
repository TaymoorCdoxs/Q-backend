// const auth = require('../controllers/auth');
const express = require('express');
const { adminDashboard, adminDashboardRestaurants, adminDashboardHospitals, viewHospitalById, viewRestaurantById, viewCorporateHospitalDetails, viewAllUsers } = require('../../controllers/admin/admin');
const { protect } = require('../../middlewares/auth.mid');
const router = express.Router();


router.route('/dashboard').get(protect, adminDashboard);
router.route('/dashboard/restaurants').get(protect, adminDashboardRestaurants);
router.route('/dashboard/hospitals').get(protect, adminDashboardHospitals);
router.route('/dashboard/hospitals').put(protect, viewCorporateHospitalDetails);
router.route('/dashboard/all/users').get(protect, viewAllUsers);
// router.route('/user').post(user);
module.exports = router;