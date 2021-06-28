// const auth = require('../controllers/auth');
const express = require('express');
const UploadFile = require('../../middlewares/imageUpload');
const { createCategory, viewCategories, editCategory, deleteCategory, updateCategoryImage } = require('../../controllers/business/Restaurants/menu/categories');
const { protect } = require('../../middlewares/auth.mid');
const { createDish, viewDishesByCategory, deleteDish, updateDish, updateDishImage } = require('../../controllers/restaurants/menu/dishes.menu');
const uploadcategoryImage = require('../../middlewares/uploadCat_image');
const router = express.Router();

// Categories
router.route('/category').post(protect, uploadcategoryImage.single('category_image'), createCategory);
router.route('/category/:id').get(viewCategories);
router.route('/category/update').put(protect, editCategory);
router.route('/category').put(protect, deleteCategory);
router.route('/category/update/image').put(protect, uploadcategoryImage.single("category_image"), updateCategoryImage);


// Dishes
router.route('/dish').post(protect, UploadFile.single("image"), createDish);
router.route('/dish/:id').get(protect, viewDishesByCategory);
router.route('/dish').put(protect, deleteDish);
router.route('/dish/update').put(protect, updateDish);
router.route('/dish/update/image').put(protect, UploadFile.single("image"), updateDishImage);

module.exports = router;