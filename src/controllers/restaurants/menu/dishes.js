const Dish = require('../../../../models/Dish.model');
const Category = require("../../../../models/Category.model");
const checkEmpty = require('../../../../middlewares/checkEmpty.mid');
const fs = require('fs');
const DishModel = require('../../../../models/Dish.model');
const ExtrasModel = require('../../../../models/Extras.model');
const Size_and_type = require('../../../../models/Size_and_types.model');
const Size_and_typesModel = require('../../../../models/Size_and_types.model');

exports.createDish = async (req, res, next) => {
    try {
        let {
            category_id,
            name,
            ingredients,
            estimated_time,
            sizes,
        } = req.body;
        console.log(req.body)
        // category_id = 1;
        // name = 'asdas';
        // ingredients = 'asdasd adasda ';
        // estimated_time = 15;
        // sizes = [{ name: 'jjkj', price: '12' }, { name: 'jjkj', price: '12' }]
        // extras = [{ name: 'jjkj', price: '12' }, { name: 'jjkj', price: '12' }]
        category_id = parseInt(category_id);
        estimatedTime = parseInt(estimated_time);
        sizes = JSON.parse(sizes)
        let dish = await saveDishesData(req, category_id, name, ingredients, estimated_time, sizes);
        if (dish == null) {
            res.status(200).json({
                status: 400,
                message: "Error while creating dish"
            })
        } else {
            return res.status(200).json({
                status: 200,
                message: "Dish added successfully"
            })
        }
        // }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating dish"
        })
    }
}
exports.createExtra = async (req, res, next) => {
    try {
        let { name, price, restaurant_id } = req.body;

        let newExtra = await ExtrasModel.create({ name, price, restaurant_id });
        if (newExtra) {
            res.status(200).json({
                status: 200,
                message: "Extra created successfully"
            })
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while creating Extra"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating Extra"
        })
    }
}
exports.viewExtras = async (req, res, next) => {
    try {
        let { restaurant_id } = req.body;
        let extras = await ExtrasModel.findAll({ where: { restaurant_id: restaurant_id } });
        if (extras.length > 0) {
            res.status(200).json({
                status: 200,
                extras
            })
        } else {
            res.status(200).json({
                status: 400,
                extras: []
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while creating Extra"
        })
    }
}
exports.editExtras = async (req, res, next) => {
    try {
        let { name, price, extra_id } = req.body;
        let extra = await ExtrasModel.findOne({ where: { id: extra_id } });
        if (extra) {
            let updateExtra = await ExtrasModel.update({ name, price }, { where: { id: extra_id } });
            if (updateExtra) {
                res.status(200).json({
                    status: 200,
                    message: "Extra updated successfully"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while updating Extra"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while updating Extra"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while updating Extra"
        })
    }
}
exports.deleteExtras = async (req, res, next) => {
    try {
        let { extra_id } = req.body;
        let extra = await ExtrasModel.findOne({ where: { id: extra_id } });
        if (extra) {
            let deleteExtra = await ExtrasModel.destroy({ where: { id: extra_id } });
            if (deleteExtra) {
                res.status(200).json({
                    status: 200,
                    message: "Extra deleted successfully"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while deleting Extra"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while deleting Extra"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while deleting Extra"
        })
    }
}
exports.viewDishesByCategory = async (req, res, next) => {
    try {
        const category_id = req.params.id;
        let category = await Category.findByPk(req.params.id);

        // Associations
        DishModel.hasMany(Size_and_type, { foreignKey: 'dish_id' });
        Size_and_type.belongsTo(DishModel, { foreignKey: 'dish_id' });

        let dishes = await DishModel.findAll({
            where: { category_id: category_id },
            include: [{
                model: Size_and_type
            }]
        });

        res.status(200).json({
            status: 200,
            category_name: category.dataValues.name,
            dishes
        })

    } catch (err) {
        next(err);
    }
}
exports.viewDishesById = async (req, res, next) => {
    try {
        const dish_id = req.params.id;

        // Associations
        DishModel.hasMany(ExtrasModel, { foreignKey: 'dish_id' });
        ExtrasModel.belongsTo(DishModel, { foreignKey: 'dish_id' });
        DishModel.hasMany(Size_and_type, { foreignKey: 'dish_id' });
        Size_and_type.belongsTo(DishModel, { foreignKey: 'dish_id' });

        let dishes = await DishModel.findOne({
            where: { id: dish_id },
            include: [{
                model: ExtrasModel
            }, {
                model: Size_and_type
            }]
        });

        res.status(200).json({
            status: 200,
            dishes
        })

    } catch (err) {
        next(err);
    }
}
exports.updateDish = async (req, res, next) => {
    try {
        let {
            dish_id,
            name,
            ingredients,
            estimated_time,
        } = req.body;

        if (checkEmpty(name) || checkEmpty(ingredients) || checkEmpty(estimated_time)) {
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
                let dish_image_path = dish.image;
                if (dish_image_path != null) {
                    if (fs.existsSync(dish_image_path)) {
                        fs.unlink(dish_image_path, async (err) => {
                            if (err) {
                                res.status(200).json({
                                    status: 400,
                                    message: "Error while deleting dish"
                                })
                                return
                            } else {
                                let deleteDish = await Dish.destroy({ where: { id: dish_id } });
                                if (deleteDish) {
                                    res.status(200).json({
                                        status: 200,
                                        message: "Dish deleted successfully"
                                    })
                                }
                            }
                        })
                    } else {
                        let deleteDish = await Dish.destroy({ where: { id: dish_id } });
                        if (deleteDish) {
                            res.status(200).json({
                                status: 200,
                                message: "Dish deleted successfully"
                            })
                        }
                    }
                } else {
                    let deleteDish = await Dish.destroy({ where: { id: dish_id } });
                    if (deleteDish) {
                        res.status(200).json({
                            status: 200,
                            message: "Dish deleted successfully"
                        })
                    }
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
exports.createDishOld = async (req, res, next) => {
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
exports.viewDishesByCategoryOld = async (req, res, next) => {
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
                    // let extras = await ExtrasModel.findAll({where: { dish_id }})
                    res.status(200).json({
                        status: 200,
                        category_name: category.dataValues.name,
                        dishes
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        category_name: category.dataValues.name,
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
exports.updateDishOld = async (req, res, next) => {
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
exports.updateDishSizeAndTypes = async (req, res, next) => {
    try {
        let {
            name,
            price,
            size_type_id
        } = req.body;

        if (checkEmpty(name) || checkEmpty(price)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            const size_and_type = await Size_and_typesModel.findByPk(size_type_id);
            if (size_and_type) {
                let update_size_and_type = await Size_and_typesModel.update(
                    {
                        name,
                        price
                    }, { where: { id: size_type_id } });
                if (update_size_and_type) {
                    res.status(200).json({
                        status: 200,
                        message: "Size and Type updated successfully"
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
exports.updateDishExtras = async (req, res, next) => {
    try {
        let {
            name,
            price,
            extras_id
        } = req.body;

        if (checkEmpty(name) || checkEmpty(price)) {
            res.status(200).json({
                status: 400,
                message: "Please provide all the required fields"
            })
        } else {
            const extra = await ExtrasModel.findByPk(extras_id);
            if (extra) {
                let update_extra = await ExtrasModel.update(
                    {
                        name,
                        price
                    }, { where: { id: extras_id } });
                if (update_extra) {
                    res.status(200).json({
                        status: 200,
                        message: "Extras updated successfully"
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
// ------------------------ Functions ------------------------
let saveDishesData = async (req, category_id, name, ingredients, estimated_time, sizes) => {
    try {
        let newDish = await DishModel.create({
            category_id: category_id,
            name: name,
            ingredients: ingredients,
            estimated_time: estimated_time,
            image: req.file.path
        });
        if (newDish) {
            console.log(newDish.dataValues.id)
            let dish_id = newDish.dataValues.id
            let failed = false;
            if (sizes.length > 0) {
                for (let i = 0; i < sizes.length; i++) {
                    let sizesForDish = await Size_and_type.create({
                        dish_id,
                        name: sizes[i].name,
                        price: sizes[i].price
                    });
                    if (sizesForDish) {
                        failed = false;
                    } else {
                        failed = true;
                    }
                }
            }
            if (failed) {
                return null
            } else {
                return newDish
            }
        } else {
            return null
        }
    } catch (err) {
        console.error(err);
    }
}