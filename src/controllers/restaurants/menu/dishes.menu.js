const Dish = require('../../../models/Dish.model');
const Category = require("../../../models/Category.model");
const Restaurant = require("../../../models/Restaurant.model");
const { checkout } = require('../../../routes/Restaurant/menu.route');
const checkEmpty = require('../../../middlewares/checkEmpty.mid');
const fs = require('fs');

exports.createDish = async (req, res, next) => {
    try {
        const {
            category_id,
            name,
            price,
            ingredients,
            estimated_time,
            image
        } = req.body;

        if (checkEmpty(name) || checkEmpty(estimated_time) || checkEmpty(ingredients) || checkEmpty(price)) {
            return res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            let dish = await Dish.create({
                name: name,
                price,
                ingredients,
                category_id,
                estimated_time,
                image: req.file.path
            });
            if (dish) {
                res.status(200).json({
                    status: 200,
                    message: "Dish has been added to the menu successfully"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while creating dish"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating dish"
        })
    }
}
exports.viewDishesByCategory = async (req, res, next) => {
    try {
        const category_id = req.params.id;
        if (checkEmpty(category_id)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all required fields"
            })
        } else {
            let category = await Category.findByPk(req.params.id);
            if (category) {
                const dishes = await Dish.findAll({ where: { category_id: category_id } });
                if (dishes.length > 0) {
                    res.status(200).json({
                        status: 200,
                        category_name: category.dataValues.name,
                        dishes
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        dishes: []
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while fetching data"
                })
            }
        }
    } catch (err) {
        next(err);
    }
}
exports.deleteDish = async (req, res, next) => {
    try {
        const { dish_id } = req.body;
        if (checkEmpty(dish_id)) {
            res.status(200).json({
                status: 400,
                message: "Dish not found"
            })
        } else {
            let dish = await Dish.findByPk(dish_id);
            if (dish) {
                let deleteDish = await Dish.destroy({ where: { id: dish_id } });
                if (deleteDish) {
                    res.status(200).json({
                        status: 200,
                        message: "Dish deleted successfully"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Dish not found"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while updating category"
        })
    }
}
exports.updateDish = async (req, res, next) => {
    try {
        let {
            dish_id,
            name,
            price,
            ingredients,
            estimated_time,
        } = req.body;

        if (checkEmpty(name) || checkEmpty(price) || checkEmpty(ingredients) || checkEmpty(estimated_time)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            const dish = await Dish.findByPk(dish_id);
            if (dish) {
                let update_dish = await Dish.update(
                    {
                        name,
                        price,
                        ingredients,
                        estimated_time
                    }, { where: { id: dish_id } });
                if (update_dish) {
                    res.status(200).json({
                        status: 200,
                        message: "Dish details updated successfully"
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: "Error while updating dish"
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
exports.updateDishImage = async (req, res, next) => {
    try {
        let dish_id = parseInt(req.body.dish_id);
        if (checkEmpty(dish_id)) {
            res.status(200).json({
                status: 400,
                message: "please provide all the required fields"
            })
        } else {
            let dish = await Dish.findByPk(dish_id);
            if (dish) {
                const path = dish.image
                console.log(dish.image)
                await fs.unlink(path, async (err) => {
                    if (err) {
                        console.log(err)
                        res.status(200).json({
                            status: 400,
                            message: "Error while updating dish"
                        })
                    } else {
                        let update_dish = await Dish.update({
                            image: req.file.path
                        }, { where: { id: dish_id } });
                        res.status(200).json({
                            status: 200,
                            message: "Image updated successfully"
                        })
                    }
                })
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