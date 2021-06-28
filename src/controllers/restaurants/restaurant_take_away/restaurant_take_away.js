const User = require('../../../../models/User.model');
const Restaurant_Take_Away = require('../../../../models/Restaurant_Take_Away.model');
const Restaurant_Take_Away_Order = require('../../../../models/Restaurant_Take_Away_Order.model');
const Restaurant_Orders_Logs = require('../../../../models/Restaurant_Order_Logs.model');
const Restaurant = require('../../../../models/Restaurant.model');
const checkEmpty = require('../../../../middlewares/checkEmpty.mid');
const accessToken = require('../../../../middlewares/token.mid');
const bcrypt = require('bcrypt');
const DishModel = require('../../../../models/Dish.model');
const RequestsModel = require('../../../../models/Requests.model');
let dbConnection = require('../../../../database/connection');
const Op = require('sequelize').Op;

// ----------------------------- Take away API's---------------------------
exports.mobileLogin = async (req, res, next) => {
    try {
        const { customer_number, customer_password, customer_name } = req.body;
        if (checkEmpty(customer_number) || checkEmpty(customer_password) || checkEmpty(customer_name)) {
            res.status(200).json({
                status: 400,
                message: 'Please provide all required fields'
            })
        } else {
            let user = await checkIfUserExists(customer_number, customer_password, customer_name);
            if (user) {
                let token = await accessToken(user);
                res.status(200).json({
                    status: 200,
                    message: "Login successful",
                    token: token,
                    user: user
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Error while logging!'
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while logging!'
        })
    }
}
exports.addToCartNew = async (req, res, next) => {
    try {
        const { restaurant_id, dish_id, quantity, notes, extra_id, status } = req.body;
        if (checkEmpty(restaurant_id) || checkEmpty(dish_id) || checkEmpty(quantity)) {
            res.status(200).json({
                status: 409,
                message: 'Please provide all required fields'
            })
        } else {
            let checkCart = await Restaurant_Take_Away_Order.findAll({ where: { dish_id: dish_id, user_id: req.user.id } });
            if (checkCart.length == 0) {
                let newOrder = await Restaurant_Take_Away_Order.create({
                    user_id: req.user.id,
                    restaurant_id,
                    dish_id,
                    quantity,
                    notes
                });
                if (newOrder) {
                    res.status(200).json({
                        status: 200,
                        message: 'Added to cart successfully'
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while adding to cart'
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Already exists in cart'
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while adding to cart'
        })
    }
}
exports.addToCart = async (req, res, next) => {
    try {
        const { restaurant_id, dish_id, quantity, notes, status, extra_id } = req.body;
        console.log(req.body)
        if (checkEmpty(restaurant_id) || checkEmpty(dish_id) || checkEmpty(quantity)) {
            res.status(200).json({
                status: 409,
                message: 'Please provide all required fields'
            })
        } else {
            let checkCart = await Restaurant_Take_Away_Order.findAll({ where: { dish_id: dish_id, user_id: req.user.id } });
            if (checkCart.length == 0) {
                let newOrder = await Restaurant_Take_Away_Order.create({
                    user_id: req.user.id,
                    restaurant_id,
                    dish_id,
                    quantity,
                    notes
                });
                if (newOrder) {
                    res.status(200).json({
                        status: 200,
                        message: 'Added to cart successfully'
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while adding to cart'
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Already exists in cart'
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while adding to cart'
        })
    }
}
exports.viewCart = async (req, res, next) => {
    try {
        DishModel.hasMany(Restaurant_Take_Away_Order, { foreignKey: 'dish_id' });
        Restaurant_Take_Away_Order.belongsTo(DishModel, { foreignKey: 'dish_id' });
        let cart_items_ = await Restaurant_Take_Away_Order.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: DishModel
            }]
        });

        let cart_items = []
        if (cart_items_.length > 0) {
            for (cart_item of cart_items_) {
                let total = 0;
                cart_items.push({ items: cart_item, total: cart_item.dataValues.quantity * cart_item.dataValues.dish.price })
            }
            res.status(200).json({
                status: 200,
                cart_items
            })
        } else {
            res.status(200).json({
                status: 200,
                cart_items: []
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching Data'
        })
    }
}
exports.updateQuantityInCart = async (req, res, next) => {
    try {
        const { status, cart_item_id } = req.body;
        const cart_item = await Restaurant_Take_Away_Order.findByPk(cart_item_id);
        if (cart_item) {
            let quantity = 0;
            if (status == 1) {
                quantity = cart_item.quantity + 1;
                const cart_item_update = await Restaurant_Take_Away_Order.update({ quantity: quantity }, { where: { id: cart_item_id } });
                res.status(200).json({
                    status: 200,
                    message: 'Cart updated successfully'
                })
            } else if (status == 0) {
                quantity = cart_item.quantity - 1;
                const cart_item_update = await Restaurant_Take_Away_Order.update({ quantity: quantity }, { where: { id: cart_item_id } });
                res.status(200).json({
                    status: 200,
                    message: 'Cart updated successfully'
                })
            }
        } else {
            res.status(200).json({
                status: 404,
                message: 'Item not found'
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while updating cart'
        })
    }
}
exports.deleteItemFromCart = async (req, res, next) => {
    try {
        const { cart_item_id } = req.body;
        const cart_item = await Restaurant_Take_Away_Order.findByPk(cart_item_id);
        if (cart_item) {
            const cart_item = await Restaurant_Take_Away_Order.destroy({ where: { id: cart_item_id } });
            if (cart_item) {
                res.status(200).json({
                    status: 200,
                    message: 'Item removed from cart successfully'
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Error while deleting cart item'
                })
            }
        } else {
            res.status(200).json({
                status: 404,
                message: 'Cart item not found'
            })
        }

    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while updating cart'
        })
    }
}
exports.confirmOrder = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Error while processing order"
            })
        } else {
            let restaurant = await Restaurant.findByPk(restaurant_id);
            let request_company = await RequestsModel.findOne({ where: { user_id: restaurant.user_id } });
            let str = request_company.company_name
            var matches = str.match(/\b(\w)/g);
            var acronym = matches.join('');
            if (restaurant) {
                let for_ticke_count = await Restaurant_Take_Away.findAll({ where: { restaurant_id: restaurant_id } });
                // console.log(for_ticke_count.length)
                // console.log(for_ticke_count[for_ticke_count.length - 1].dataValues.ticket_no);

                if (for_ticke_count.length > 0) {
                    let ticket_number = for_ticke_count[for_ticke_count.length - 1].dataValues.ticket_no.split('-');
                    let order = await Restaurant_Take_Away.create({
                        user_id: req.user.id,
                        restaurant_id,
                        status: "waiting",
                        ticket_no: `${acronym}-${parseInt(ticket_number[1]) + 1}`
                    })
                    res.status(200).json({
                        status: 200,
                        message: "Order confirmed"
                    })
                } else {
                    let order = await Restaurant_Take_Away.create({
                        user_id: req.user.id,
                        restaurant_id,
                        status: "waiting",
                        ticket_no: `${acronym}-1`
                    })
                    res.status(200).json({
                        status: 200,
                        message: "Order confirmed"
                    })
                }
            } else {
                res.status(200).json({
                    status: 404,
                    message: "Restaurant not found"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing order"
        })
    }
}
exports.viewConfirmedOrder = async (req, res, next) => {
    try {
        const ticket_detail = await Restaurant_Take_Away.findOne({
            where: {
                user_id: req.user.id,
                status: { [Op.ne]: 'done' }
            }
        });
        // console.log(ticket_detail)
        if (ticket_detail) {
            let cart_items = [];
            DishModel.hasMany(Restaurant_Take_Away_Order, { foreignKey: 'dish_id' });
            Restaurant_Take_Away_Order.belongsTo(DishModel, { foreignKey: 'dish_id' });
            let cart_items_ = await Restaurant_Take_Away_Order.findAll({
                where: { user_id: req.user.id },
                include: [{
                    model: DishModel
                }]
            });
            if (cart_items_.length > 0) {
                for (cart_item of cart_items_) {
                    let total = 0;
                    cart_items.push({ items: cart_item, total: cart_item.dataValues.quantity * cart_item.dataValues.dish.price })
                }
            }
            let estimated_Time = await estimatedTime(cart_items_)
            res.status(200).json({
                ticket_no: ticket_detail.dataValues.ticket_no,
                user_name: req.user.name,
                status: ticket_detail.dataValues.status,
                estimated_time: estimated_Time,
                order: cart_items
            })
        } else {
            res.status(200).json({
                ticket_no: 'N/A',
                user_name: req.user.name,
                status: 'N/A',
                estimated_time: 0,
                order: []
            })
        }

    } catch (err) {
        next(err);
        console.log(err)
        res.status(200).json({
            status: 400,
            message: "Error while fetching order"
        })
    }
}
exports.viewOrdersOverall = async (req, res, next) => {
    try {
        let restaurant_id = req.params.restaurant_id;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let orders = await Restaurant_Take_Away.findAll({
                where: { restaurant_id: restaurant_id }
            });
            let orders_in_waiting = 0;
            let orders_in_working = 0;
            let orders_ready = 0;
            let orders_served = 0;
            if (orders.length > 0) {
                for (let i = 0; i < orders.length; i++) {
                    if (orders[i].dataValues.status == "waiting") {
                        orders_in_waiting++
                    } else if (orders[i].dataValues.status == "working") {
                        orders_in_working++
                    } else if (orders[i].dataValues.status == "ready") {
                        orders_ready++
                    } else if (orders[i].dataValues.status == "done") {
                        orders_served++
                    }
                }
                res.status(200).json({
                    status: 200,
                    orders_in_waiting,
                    orders_in_working,
                    orders_ready,
                    orders_served,
                    total_orders: orders.length
                })

            } else {
                res.status(200).json({
                    status: 200,
                    orders_in_waiting,
                    orders_in_working,
                    orders_ready,
                    orders_served
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching orders"
        })
    }
}
exports.viewOrdersInWaiting = async (req, res, next) => {
    try {
        let restaurant_id = req.params.restaurant_id;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT ta.id, u.id AS user_id,ticket_no AS ticket_no, u.name AS user_name, d.name AS dish_name, d.price, tao.quantity, (d.price * tao.quantity) AS total FROM restaurant_take_aways ta";
            query += " JOIN restaurant_take_away_orders tao ON tao.restaurant_id = ta.restaurant_id AND tao.user_id = ta.user_id";
            query += " JOIN users u ON u.id = ta.user_id"
            query += " JOIN dishes d ON d.id = tao.dish_id WHERE ta.status = 'waiting' AND ta.restaurant_id =" + restaurant_id
            query += " ORDER BY ta.createdAt"

            let query1 = "SELECT * FROM users"
            console.log(query)
            let data = await dbConnection.query(query)
            let userIds = [];
            for (order of data[0]) {
                userIds.push(order.user_id)
            }
            let unique_userIds = [...new Set(userIds)]
            console.log(unique_userIds)
            let orders = [];
            for (unique of unique_userIds) {
                let order_object = [];
                for (order of data[0]) {
                    if (order.user_id == unique)
                        order_object.push(order)
                }
                orders.push({ order: order_object })
            }
            res.status(200).json({
                orders
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching order"
        })
    }
}
exports.viewOrdersInWorking = async (req, res, next) => {
    try {
        let restaurant_id = req.params.restaurant_id;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT ta.id, u.id AS user_id,ticket_no AS ticket_no, u.name AS user_name, d.name AS dish_name, d.price, tao.quantity, (d.price * tao.quantity) AS total FROM restaurant_take_aways ta";
            query += " JOIN restaurant_take_away_orders tao ON tao.restaurant_id = ta.restaurant_id AND tao.user_id = ta.user_id";
            query += " JOIN users u ON u.id = ta.user_id"
            query += " JOIN dishes d ON d.id = tao.dish_id WHERE ta.status = 'working' AND ta.restaurant_id =" + restaurant_id
            query += " ORDER BY ta.createdAt"

            let query1 = "SELECT * FROM users"
            console.log(query)
            let data = await dbConnection.query(query)
            let userIds = [];
            for (order of data[0]) {
                userIds.push(order.user_id)
            }
            let unique_userIds = [...new Set(userIds)]
            let orders = [];
            for (unique of unique_userIds) {
                let order_object = [];
                for (order of data[0]) {
                    if (order.user_id == unique)
                        order_object.push(order)
                }
                orders.push({ order: order_object })
            }
            res.status(200).json({
                orders
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching order"
        })
    }
}
exports.viewOrdersReady = async (req, res, next) => {
    try {
        let restaurant_id = req.params.restaurant_id;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT ta.id, u.id AS user_id,ticket_no AS ticket_no, u.name AS user_name, d.name AS dish_name, d.price, tao.quantity, (d.price * tao.quantity) AS total FROM restaurant_take_aways ta";
            query += " JOIN restaurant_take_away_orders tao ON tao.restaurant_id = ta.restaurant_id AND tao.user_id = ta.user_id";
            query += " JOIN users u ON u.id = ta.user_id"
            query += " JOIN dishes d ON d.id = tao.dish_id WHERE ta.status = 'ready' AND ta.restaurant_id =" + restaurant_id
            query += " ORDER BY ta.createdAt"

            let query1 = "SELECT * FROM users"
            console.log(query)
            let data = await dbConnection.query(query)
            let userIds = [];
            for (order of data[0]) {
                userIds.push(order.user_id)
            }
            let unique_userIds = [...new Set(userIds)]
            let orders = [];
            for (unique of unique_userIds) {
                let order_object = [];
                for (order of data[0]) {
                    if (order.user_id == unique)
                        order_object.push(order)
                }
                orders.push({ order: order_object })
            }
            res.status(200).json({
                orders
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching order"
        })
    }
}
exports.viewOrdersServed = async (req, res, next) => {
    try {
        let restaurant_id = req.params.restaurant_id;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT ta.id, u.id AS user_id,ticket_no AS ticket_no, u.name AS user_name, d.name AS dish_name, d.price, tao.quantity, (d.price * tao.quantity) AS total FROM restaurant_take_aways ta";
            query += " JOIN restaurant_orders_logs tao ON tao.restaurant_id = ta.restaurant_id AND tao.user_id = ta.user_id";
            query += " JOIN users u ON u.id = ta.user_id"
            query += " JOIN dishes d ON d.id = tao.dish_id WHERE ta.status = 'done' AND ta.restaurant_id =" + restaurant_id
            query += " ORDER BY ta.createdAt"

            let query1 = "SELECT * FROM users"
            console.log(query)
            let data = await dbConnection.query(query)
            let userIds = [];
            for (order of data[0]) {
                userIds.push(order.user_id)
            }
            let unique_userIds = [...new Set(userIds)]
            let orders = [];
            for (unique of unique_userIds) {
                let order_object = [];
                for (order of data[0]) {
                    if (order.user_id == unique)
                        order_object.push(order)
                }
                orders.push({ order: order_object })
            }
            res.status(200).json({
                orders
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while fetching order"
        })
    }
}
exports.proceedOrderForWorking = async (req, res, next) => {
    try {
        let order_id = req.params.order_id;
        let order = await Restaurant_Take_Away.findByPk(order_id)
        if (order) {
            let updateOrder = await Restaurant_Take_Away.update({
                status: "working", workingAt: new Date()
            },
                {
                    where: { id: order_id }
                })
            if (updateOrder) {
                res.status(200).json({
                    status: 200,
                    message: "Order proceeded for working"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing order"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing order"
        })
    }
}
exports.OrderReadyForServing = async (req, res, next) => {
    try {
        let order_id = req.params.order_id;
        let order = await Restaurant_Take_Away.findByPk(order_id)
        if (order) {
            let updateOrder = await Restaurant_Take_Away.update({
                status: "ready", readyAt: new Date()
            },
                {
                    where: { id: order_id }
                })
            if (updateOrder) {
                res.status(200).json({
                    status: 200,
                    message: "Order ready to be delivered"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing order"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing order"
        })
    }
}
exports.OrderServed = async (req, res, next) => {
    try {
        let order_id = req.params.order_id;
        let { remarks, rating } = req.body;
        let order = await Restaurant_Take_Away.findByPk(order_id)
        // console.log(order)
        if (order) {
            let updateOrder = await Restaurant_Take_Away.update({
                status: "done", completedAt: new Date()
            },
                {
                    where: { id: order_id }
                })
            if (updateOrder) {
                let order_details = await Restaurant_Take_Away_Order.findAll({ where: { user_id: order.dataValues.user_id } });
                if (order_details.length > 0) {
                    for (let i = 0; i < order_details.length; i++) {
                        let orderLog = await Restaurant_Orders_Logs.create({
                            restaurant_id: order_details[i].dataValues.restaurant_id,
                            order_id: order_id,
                            user_id: order_details[i].dataValues.user_id,
                            dish_id: order_details[i].dataValues.dish_id,
                            quantity: order_details[i].dataValues.quantity,
                        });
                        if (orderLog) {
                            let deleteOrderDetails = await Restaurant_Take_Away_Order.destroy({ where: { id: order_details[i].dataValues.id } });
                        }
                    }
                }
                res.status(200).json({
                    status: 200,
                    message: "Order served"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing order"
                })
            }
        }
    } catch (err) {
        next(err);
        console.log(err.message)
        res.status(200).json({
            status: 400,
            message: "Error while processing order"
        })
    }
}
exports.orderRatingAndRemarks = async (req, res, next) => {
    try {
        let { remarks, rating, ticket_no } = req.body;
        let order = await Restaurant_Take_Away.findOne({ where: { ticket_no: ticket_no } })
        if (order) {
            let updateOrder = await Restaurant_Take_Away.update({
                remarks: remarks, rating: rating
            },
                {
                    where: { ticket_no: ticket_no }
                })
            if (updateOrder) {
                res.status(200).json({
                    status: 200,
                    message: "Order served"
                })
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing order"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while processing order"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while processing order"
        })
    }
}

// --------------------------------functions-----------------------------
let checkIfUserExists = async (customer_number, customer_password, customer_name) => {
    if (customer_number.includes('.com')) {
        const user = await User.findOne({ where: { email: customer_number } });
        if (user) {
            return user.dataValues
        } else {
            let user = await createNewUser(customer_number, customer_password, customer_name);
            if (user) {
                return user
            } else {
                return null
            }
        }
    } else {
        const user = await User.findOne({ where: { cell: customer_number } });
        if (user) {
            return user.dataValues
        } else {
            let user = await createNewUserWithMobile(customer_number, customer_password, customer_name);
            if (user) {
                return user
            } else {
                return null
            }
        }
    }
}
let createNewUser = async (customer_number, customer_password, customer_name) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(customer_password, salt);
    const user = await User.create({
        email: customer_number,
        password: hash,
        name: customer_name,
        role_id: 1
    })

    if (user) {
        return user.dataValues
    }
    else
        return null;
}
let createNewUserWithMobile = async (customer_number, customer_password, customer_name) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(customer_password, salt);
    const user = await User.create({
        cell: customer_number,
        password: hash,
        name: customer_name,
        role_id: 1
    })

    if (user) {
        return user.dataValues
    }
    else
        return null;
}
let estimatedTime = async (items) => {
    let estimated_time = 0;
    let estimatedTimes = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].dataValues.quantity == 1) {
            estimated_time += items[i].dataValues.dish.dataValues.estimated_time
            estimatedTimes.push(estimated_time)
        } else {
            let start = items[i].dataValues.estimated_time
            for (let k = 0; k < items[i].dataValues.quantity; k++) {
                estimated_time = estimated_time + (0.1 * items[i].dataValues.dish.dataValues.estimated_time)
            }
            estimatedTimes.push(estimated_time)
        }
    }
    estimatedTimes.sort();

    return estimatedTimes[estimatedTimes.length];
}

// -------------------------- Restaurant Take Away New ----------------------------------------------------



