const e = require("cors");
const Category = require("../../../../models/Category.model");
const Restaurant = require("../../../../models/Restaurant.model");
const Sequelize = require('sequelize');
const CategoryModel = require("../../../../models/Category.model");
const checkEmpty = require("../../../../middlewares/checkEmpty.mid");
const fs = require("fs");

exports.viewCategories = async (req, res, next) => {
    try {
        let restaurant = await Restaurant.findByPk(req.params.id);
        if (restaurant) {
            let categories = await Category.findAll({ where: { restaurant_id: restaurant.id } })
            if (categories) {
                res.status(200).json({
                    status: 200,
                    categories
                })
            } else {
                res.status(200).json({
                    status: 200,
                    categories: []
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while fetching categories"
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching"
        })
    }
}
exports.createCategory = async (req, res, next) => {
    try {
        const { name } = req.body;
        let restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (restaurant) {
            let category = await Category.create({
                name,
                restaurant_id: restaurant.id,
                image: req.file.path
            });
            if (category) {
                res.status(200).json({
                    status: 200,
                    message: "Category created successfully"
                })
            } else {
                res.status(200).json({
                    status: 200,
                    message: "Error while creating category"
                })
            }
        } else {
            res.status(200).json({
                status: 200,
                message: "Error while creating category"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 200,
            message: "Error while creating category"
        })
    }
}
exports.editCategory = async (req, res, next) => {
    try {
        const { name, category_id } = req.body;
        let category_id_ = category_id
        let restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (restaurant) {
            let category = await Category.findOne({
                where: {
                    id: category_id_
                }
            });
            if (category) {
                let update_category = await Category.update(
                    { name: name },
                    { where: { id: category_id_ } });
                if (update_category) {
                    res.status(200).json({
                        status: 200,
                        message: "Category updated successfully"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while updating category"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while updating category"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while updating category"
        })
    }
}
exports.deleteCategory = async (req, res, next) => {
    try {
        const { category_id } = req.body;
        let category_id_ = category_id
        let restaurant = await Restaurant.findOne({ where: { user_id: req.user.id } });
        if (restaurant) {
            let category = await Category.findOne({
                where: {
                    id: category_id_
                }
            });
            if (category) {
                let update_category = await Category.destroy({ where: { id: category_id_ } });
                if (update_category) {
                    res.status(200).json({
                        status: 200,
                        message: "Category deleted successfully"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while deleting category"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while deleting category"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while updating category"
        })
    }
}
exports.updateCategoryImage = async (req, res, next) => {
    try {
        let category_id = parseInt(req.body.category_id);
        if (checkEmpty(category_id)) {
            res.status(200).json({
                status: 409,
                message: "please provide all the required fields"
            })
        } else {
            let category = await CategoryModel.findByPk(category_id);
            if (category) {
                const path = category.image
                if (path === undefined || path == "") {
                    let update_category = await CategoryModel.update({
                        image: req.file.path
                    }, { where: { id: category_id } });
                    res.status(200).json({
                        status: 200,
                        message: "Image updated successfully"
                    })
                } else {
                    await fs.unlink(path, async (err) => {
                        if (err) {
                            console.log(err)
                            res.status(200).json({
                                status: 400,
                                message: "Error while updating dish"
                            })
                        } else {
                            let update_category = await CategoryModel.update({
                                image: req.file.path
                            }, { where: { id: category_id } });
                            res.status(200).json({
                                status: 200,
                                message: "Image updated successfully"
                            })
                        }
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while updating dish"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while updating dish"
        })
    }
}


