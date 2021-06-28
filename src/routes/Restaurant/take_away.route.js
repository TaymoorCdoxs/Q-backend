// const auth = require('../controllers/auth');
const express = require('express');
const { mobileLogin } = require('../../controllers/business/Restaurants/restaurant_take_away/restaurant_take_away');
const { protect } = require('../../middlewares/auth.mid');
const router = express.Router();

router.route('/login').post(mobileLogin);
module.exports = router;