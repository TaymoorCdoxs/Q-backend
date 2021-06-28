// const auth = require('../controllers/auth');
const express = require('express');
const { createBusinessType, viewBusinessTypes } = require('../controllers/business/business_types');
const router = express.Router();

router.route('/').post(createBusinessType);
router.route('/').get(viewBusinessTypes);
// router.route('/user').post(user);
module.exports = router;