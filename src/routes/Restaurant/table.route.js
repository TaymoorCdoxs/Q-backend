// const auth = require('../controllers/auth');
const express = require('express');
const { viewAllTables, deleteTable, createTables, editTables } = require('../../controllers/business/Restaurants/tables/tables');
const { protect } = require('../../middlewares/auth.mid');
const router = express.Router();

router.route('/').get(protect, viewAllTables);
router.route('/').put(protect, deleteTable);
router.route('/').post(protect, createTables);
router.route('/update').put(protect, editTables);
module.exports = router;