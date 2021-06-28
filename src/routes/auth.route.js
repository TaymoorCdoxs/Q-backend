// const auth = require('../controllers/auth');
const express = require('express');
const { register, login } = require('../controllers/auth/auth');
const { protect } = require('../middlewares/auth.mid');
const router = express.Router();

router.route('/register/:status').post(register);
router.route('/login').post(login);
// router.route('/user').post(user);
module.exports = router;