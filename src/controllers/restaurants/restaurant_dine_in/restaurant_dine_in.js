const User = require('../../../../models/User.model');
const Table = require('../../../../models/Table.model');
const Restaurant_DIne_In = require('../../../../models/Restaurant_dine_in.model');
const Restaurant_DIne_In_Orders = require('../../../../models/Restaurent_dine_in_orders.model');
const Restaurant_Dine_In_Order_Logs = require('../../../../models/Restaurant_Dine_In_Orders_logs.model');
const EmployeeModel = require('../../../../models/Employee.model');
const RestaurantModel = require('../../../../models/Restaurant.model');
const checkEmpty = require('../../../../middlewares/checkEmpty.mid');
const bcrypt = require('bcrypt');
const accessToken = require('../../../../middlewares/token.mid');
const Op = require('sequelize').Op;

// --------------------------Logins and assign tables-----------------------------
exports.mobileLoginForDineIn = async (req, res, next) => {
    try {
        let { customer_number, customer_password, customer_name, persons, family, restaurant_id } = req.body;
        console.log(req.body);
        // customer_number = "+923048327482"
        // customer_password = "11111111"
        // customer_name = "jane"
        // persons = 2
        // family = 1
        // restaurant_id = 21

        if (checkEmpty(customer_number) || checkEmpty(customer_password) || checkEmpty(customer_name)) {
            res.status(200).json({
                status: 400,
                message: 'Please provide all required fields'
            })
        } else {
            let user = await checkIfUserExists(customer_number, customer_password, customer_name);
            let token = await accessToken(user);
            if (user == null) {
                res.status(200).json({
                    status: 400,
                    message: 'Invalid credentials'
                })
            } else {
                let order = await Restaurant_DIne_In.findOne({ where: { user_id: user.id, status: { [Op.ne]: "done" }, restaurant_id: restaurant_id } });
                if (order) {
                    // console.log('11111111111111', order.dataValues.has_family)
                    let assignedTableToUser = await Table.findOne({ where: { ticket_id: order.dataValues.id } })
                    if (assignedTableToUser) {
                        await returnAssignedOrderDetails(user, res, token, assignedTableToUser, order);
                    } else {
                        let tables = await Table.findAll({
                            where:
                            {
                                restaurant_id: restaurant_id,
                                status: 0,
                                person_count: persons,
                                family: family
                            }
                        })
                        if (tables.length > 0) {
                            await assignNewTable(tables, order, user, token)
                        } else {
                            // console.log(order)
                            await ticketAssignedButTableNotFree(order, user, token, res);
                        }
                    }
                } else {
                    let tables = await Table.findAll({
                        where:
                        {
                            restaurant_id: restaurant_id,
                            status: 0,
                            person_count: persons,
                            family: family
                        }
                    });
                    if (tables.length > 0) {
                        await assignTableWithNewOrder(res, tables, restaurant_id, user, token, persons, family);
                    } else {
                        await assignNewTicketButTableNotFree(restaurant_id, user, persons, family, res, token);
                    }
                }
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
exports.mobileLoginForAppSide = async (req, res, next) => {
    try {
        let { restaurant_id, persons, family } = req.body;
        console.log(req.body)
        // if (checkEmpty(restaurant_id) || checkEmpty(persons) || checkEmpty(family)) {
        //     res.status(200).json({
        //         status: 409,
        //         message: "Please provide all the required fields"
        //     })
        // } else {
            let tables = await Table.findAll({
                where: {
                    status: 0,
                    person_count: persons,
                    family: family,
                    restaurant_id: restaurant_id
                }
            });
            if (tables.length > 0) {
                let table_toBeAssigned_id = tables[0].dataValues.id;
                let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
                let ticket_no = 0;
                if (forTicketCount.length > 0) {
                    ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
                }
                let new_customer_in_queue = await Restaurant_DIne_In.create({
                    ticket_no,
                    restaurant_id,
                    user_id: req.user.id,
                    persons,
                    has_family: family,
                    status: "waiting",
                    dine_in: new Date().getTime(),
                });
                if (new_customer_in_queue) {
                    let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
                    if (table_for_new_user) {
                        let assignTableToUser = await Table.update({ ticket_id: new_customer_in_queue.id, status: 2 },
                            {
                                where: {
                                    id: table_toBeAssigned_id
                                }
                            })
                        if (assignTableToUser) {
                            if (family == 1) {
                                res.status(200).json({
                                    status: 200,
                                    table_name: table_for_new_user.name,
                                    table_assigned: true,
                                    family_section: true,
                                    ticket_no: parseInt(new_customer_in_queue.ticket_no)
                                })
                            } else {
                                res.status(200).json({
                                    status: 200,
                                    table_name: table_for_new_user.name,
                                    table_assigned: true,
                                    family_section: false,
                                    ticket_no: parseInt(new_customer_in_queue.ticket_no)
                                })
                            }
                        } else {
                            res.status(200).json({
                                status: 400,
                                message: 'Error while assigning table!'
                            })
                        }
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: 'Error while assigning table!'
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while assigning table!'
                    })
                }
            } else {
                let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
                let ticket_no = 0;
                if (forTicketCount.length > 0) {
                    ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
                }
                let new_customer_in_queue = await Restaurant_DIne_In.create({
                    ticket_no,
                    restaurant_id,
                    user_id: req.user.id,
                    persons,
                    has_family: family,
                    status: "in-queue",
                });
                if (new_customer_in_queue) {
                    if (family == 1) {
                        res.status(200).json({
                            status: 200,
                            table_name: "",
                            table_assigned: false,
                            family_section: true,
                            ticket_no: parseInt(new_customer_in_queue.ticket_no)
                        })
                    } else {
                        res.status(200).json({
                            status: 200,
                            table_name: "",
                            table_assigned: false,
                            family_section: false,
                            ticket_no: parseInt(new_customer_in_queue.ticket_no)
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while assigning table!'
                    })
                }
            }

        // }

    } catch (err) {
        next(err);
    }
}
exports.checkIfOrderExistsAndAssignTableIfAvailable = async (req, res, next) => {
    try {
        let { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: 'Please provide all required fields'
            })
        } else {
            let order = await Restaurant_DIne_In.findOne({ where: { restaurant_id: restaurant_id, user_id: req.user.id, status: { [Op.ne]: 'done' } } });
            // console.log(order.dataValues);
            if (order) {
                let table = await Table.findOne({ where: { restaurant_id: restaurant_id, ticket_id: order.dataValues.id } });
                // console.log(table.dataValues);
                if (table) {
                    if (order.dataValues.has_family == 1) {
                        res.status(200).json({
                            status: 200,
                            message: true,
                            customer_name: req.user.name,
                            table_name: table.dataValues.name,
                            table_assigned: true,
                            family_section: true,
                            ticket_no: parseInt(order.dataValues.ticket_no)
                        })
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: true,
                            customer_name: req.user.name,
                            table_name: table.dataValues.name,
                            table_assigned: true,
                            family_section: false,
                            ticket_no: parseInt(order.dataValues.ticket_no)
                        })
                    }
                } else {
                    let tables = await Table.findAll({
                        where: {
                            restaurant_id: restaurant_id,
                            status: 0,
                            family: order.dataValues.has_family,
                            person_count: order.dataValues.persons
                        }
                    });
                    if (tables.length > 0) {
                        let table_toBeAssigned_id = tables[0].dataValues.id;
                        let update_order = await Restaurant_DIne_In.update({ status: "waiting", dine_in: new Date() },
                            {
                                where: {
                                    id: order.dataValues.id
                                }
                            });
                        if (update_order) {
                            let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
                            if (table_for_new_user) {
                                let assignTableToUser = await Table.update({ ticket_id: order.dataValues.id, status: 2 },
                                    {
                                        where: {
                                            id: table_toBeAssigned_id
                                        }
                                    })
                                if (assignTableToUser) {
                                    if (order.dataValues.family == 1) {
                                        res.status(200).json({
                                            status: 200,
                                            message: true,
                                            customer_name: req.user.name,
                                            table_name: table_for_new_user.name,
                                            table_assigned: true,
                                            family_section: true,
                                            ticket_no: parseInt(order.dataValues.ticket_no)
                                        })
                                    } else {
                                        res.status(200).json({
                                            status: 200,
                                            message: true,
                                            customer_name: req.user.name,
                                            table_name: table_for_new_user.name,
                                            table_assigned: true,
                                            family_section: false,
                                            ticket_no: parseInt(order.dataValues.ticket_no)
                                        })
                                    }
                                } else {
                                    res.status(200).json({
                                        status: 400,
                                        message: 'Error while assigning table!'
                                    })
                                }
                            } else {
                                res.status(200).json({
                                    status: 400,
                                    message: 'Error while assigning table!'
                                })
                            }
                        } else {
                            res.status(200).json({
                                status: 400,
                                message: 'Error while assigning table!'
                            })
                        }
                    } else {
                        if (order.dataValues.has_family == 1) {
                            res.status(200).json({
                                status: 200,
                                message: true,
                                customer_name: req.user.name,
                                table_name: "",
                                table_assigned: false,
                                family_section: true,
                                ticket_no: order.dataValues.ticket_no
                            })
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: true,
                                customer_name: req.user.name,
                                table_name: "",
                                table_assigned: false,
                                family_section: false,
                                ticket_no: order.dataValues.ticket_no
                            })
                        }
                    }
                }
            } else {
                res.status(200).json({
                    status: 200,
                    message: false
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching data'
        })
    }
}
exports.employeeDashBoardForDineIn = async (req, res, next) => {
    try {
        let employee = await EmployeeModel.findOne({ where: { user_id: req.user.id } });
        if (employee) {
            let restaurant = await RestaurantModel.findOne({ where: { user_id: employee.panel_id } });
            if (restaurant) {
                let tables = await Table.findAll({ where: { restaurant_id: restaurant.id } });
                if (tables.length > 0) {
                    let tables_ready = [];
                    let tables_ready_to_clean = [];
                    let tables_occupied = [];
                    for (let i = 0; i < tables.length; i++) {
                        if (tables[i].dataValues.status == 0) {
                            tables_ready.push(tables[i].dataValues)
                        } else if (tables[i].dataValues.status == 1) {
                            tables_ready_to_clean.push(tables[i].dataValues)
                        } else if (tables[i].dataValues.status == 2) {
                            tables_occupied.push(tables[i].dataValues)
                        }
                    }
                    res.status(200).json({
                        status: 200,
                        tables_ready: tables_ready.length,
                        tables_ready_to_clean: tables_ready_to_clean.length,
                        tables_occupied: tables_occupied.length
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while fetching data'
                    })
                }
            }
        }

    } catch (err) {
        next(err);
    }
}

// ------------------------------Tables-------------------------------------------
exports.tablesDetailsForOccupied = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT t.family AS family, t.person_count AS persons_count, t.status AS status,t.id AS table_id, u.id AS user_id, u.name AS user_name, t.name AS table_n FROM `tables` t "
            query += "LEFT JOIN `restaurant_dine_ins` d ON d.id=ticket_id "
            query += 'LEFT JOIN `users` u ON u.id=d.user_id WHERE t.status=2 AND t.restaurant_id=' + restaurant_id

            let data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            res.status(200).json({
                status: 200,
                data,
            })
        }
    } catch (err) {
        next(err);
    }
}
exports.tablesDetailsForOccupiedAndWorking = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT t.status AS status,t.id AS table_id, u.id AS user_id, u.name AS user_name, t.name"
            query += ' AS table_n, t.person_count AS persons_count, t.family AS family FROM `tables` t '
            query += "LEFT JOIN `restaurant_dine_ins` d ON d.id=ticket_id "
            query += 'LEFT JOIN `users` u ON u.id=d.user_id WHERE t.status=3 AND t.restaurant_id=' + restaurant_id

            let data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
            res.status(200).json({
                status: 200,
                data,
            })
        }
    } catch (err) {
        next(err);
    }
}
exports.tablesDetailsForOccupiedAndServing = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT t.status AS status,t.id AS table_id, u.id AS user_id, u.name AS user_name, t.name"
            query += ' AS table_n, t.person_count AS persons_count, t.family AS family FROM `tables` t '
            query += "LEFT JOIN `restaurant_dine_ins` d ON d.id=ticket_id "
            query += 'LEFT JOIN `users` u ON u.id=d.user_id WHERE t.status=4 AND t.restaurant_id=' + restaurant_id

            let data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
            console.log(data)
            res.status(200).json({
                status: 200,
                data,
            })
        }
    } catch (err) {
        next(err);
    }
}
exports.tablesDetailsForUnOcupiedAndReady = async (req, res, next) => {
    try {
        const { restaurant_id } = req.body;
        if (checkEmpty(restaurant_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let query = "SELECT t.status AS status,t.id AS table_id, u.id AS user_id, u.name AS user_name, t.name"
            query += ' AS table_n, t.person_count AS persons_count, t.family AS family FROM `tables` t '
            query += "LEFT JOIN `restaurant_dine_ins` d ON d.id=ticket_id "
            query += 'LEFT JOIN `users` u ON u.id=d.user_id WHERE (t.status=0 OR t.status=1) AND t.restaurant_id=' + restaurant_id
            let data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
            res.status(200).json({
                status: 200,
                data,
            })
        }
    } catch (err) {
        next(err);
    }
}
exports.cleanTable = async (req, res, next) => {
    try {
        let { table_id } = req.body;
        if (checkEmpty(table_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let table = await Table.findByPk(table_id);
            if (table) {
                let updateTable = await Table.update({ status: 0, ticket_id: null }, {
                    where: { id: table_id },
                })
                if (updateTable) {
                    res.status(200).json({
                        status: 200,
                        message: "Table cleared!"
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while clearing table!'
                    })
                }
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while clearing table!'
        })
    }
}
exports.tableEmptyToBeCleaned = async (req, res, next) => {
    try {
        let { table_id } = req.body
        if (checkEmpty(table_id)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            let table = await Table.findByPk(table_id);
            if (table) {
                let updateTable = await Table.update({ status: 0 }, {
                    where: { id: table_id },
                })
                if (updateTable) {
                    res.status(200).json({
                        status: 200,
                        message: "Table cleared!"
                    })
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while clearing table!'
                    })
                }
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while clearing table!'
        })
    }
}

// -------------------------------Order-------------------------------------------
exports.addToCartOnDineIn = async (req, res, next) => {
    try {
        let { dishes, user_id, restaurant_id, table_id } = req.body;
        if (checkEmpty(table_id) || checkEmpty(user_id) || checkEmpty(restaurant_id) || checkEmpty(dishes)) {
            res.status(200).json({
                status: 409,
                message: "Please provide all the required fields"
            })
        } else {
            if (dishes.length > 0) {
                let order = await Restaurant_DIne_In.findOne({ where: { user_id: user_id, status: { [Op.ne]: "done" } } });
                if (order) {
                    let failed = false;
                    for (let i = 0; i < dishes.length; i++) {
                        let newItem = await Restaurant_DIne_In_Orders.create({
                            user_id,
                            restaurant_id,
                            table_id,
                            dish_id: dishes[i].id,
                            quantity: dishes[i].quantity
                        });
                        if (newItem) {
                            failed = false;
                        } else {
                            failed = true;
                        }
                    }
                    if (failed) {
                        res.status(200).json({
                            status: 200,
                            message: "Error while taking order"
                        })
                    } else {
                        let update_order = await Restaurant_DIne_In.update({ status: "working", order_taken: new Date() }, { where: { id: order.dataValues.id } });
                        if (update_order) {
                            let update_table = await Table.update({ status: 3 }, { where: { id: table_id } });
                            if (update_table) {
                                res.status(200).json({
                                    status: 200,
                                    message: "Order placed successfully"
                                })
                            }
                        }
                    }
                } else {
                    res.status(200).json({
                        status: 409,
                        message: "Error while taking order"
                    })
                }
            } else {
                res.status(200).json({
                    status: 409,
                    message: "Please provide all the required fields"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: "Error while adding to cart"
        })
    }
}
exports.viewCart = async (req, res, next) => {
    try {
        let { restaurant_id, user_id } = req.body;
        let query = "SELECT d.id AS id, d.name AS dish_name, d.category_id AS category_id, c.name AS category_name, d.price AS price, d.image AS image, "
        query += " d.ingredients AS ingredients, d.estimated_time AS estimated_time, orders.quantity AS quantity "
        query += ' FROM `restaurant_dine_in_orders` orders '
        query += ' JOIN `dishes` d ON d.id=orders.dish_id && orders.user_id=' + user_id + ' && orders.restaurant_id=' + restaurant_id
        query += ' JOIN `categories` c on c.id=d.category_id'

        let cart_items = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT })
        res.status(200).json({
            status: 200,
            cart_items,
        })
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching Data'
        })
    }
}
exports.serveOrder = async (req, res, next) => {
    try {
        let { restaurant_id, table_id, user_id } = req.body;
        let serveOrder = await Restaurant_DIne_In.findOne({ where: { user_id: user_id, restaurant_id: restaurant_id, status: { [Op.ne]: 'done' } } });
        if (serveOrder) {
            let updateOrder = await Restaurant_DIne_In.update({ status: 'served', order_served: new Date() }, { where: { id: serveOrder.dataValues.id } });
            if (updateOrder) {
                let updateTablesStatus = await Table.update({ status: 4 }, { where: { id: table_id } });
                if (updateTablesStatus) {
                    res.status(200).json({
                        status: 200,
                        message: "Order served successfully!"
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while processing order"
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: "Error while updating order"
            })
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while processing order'
        })
    }
}
exports.clearOrder = async (req, res, next) => {
    try {
        let { restaurant_id, table_id, user_id } = req.body;
        console.log(req.body)
        let serveOrder = await Restaurant_DIne_In.findOne({ where: { user_id: user_id, restaurant_id: restaurant_id, status: { [Op.ne]: 'done' } } });
        if (serveOrder) {
            let updateOrder = await Restaurant_DIne_In.update({ status: 'done', done_queue: new Date() }, { where: { id: serveOrder.dataValues.id } });
            if (updateOrder) {
                let updateTablesStatus = await Table.update({ status: 1 }, { where: { id: table_id } });
                if (updateTablesStatus) {
                    let cart_items = await Restaurant_DIne_In_Orders.findAll({ where: { restaurant_id: restaurant_id, user_id: user_id } });
                    if (cart_items.length > 0) {
                        let failed = false;
                        for (let i = 0; i < cart_items.length; i++) {
                            let orderLog = await Restaurant_Dine_In_Order_Logs.create({
                                restaurant_id: cart_items[i].dataValues.restaurant_id,
                                order_id: serveOrder.dataValues.id,
                                user_id: cart_items[i].dataValues.user_id,
                                dish_id: cart_items[i].dataValues.dish_id,
                                quantity: cart_items[i].dataValues.quantity,
                            });
                            if (orderLog) {
                                let removeOrderDetailsRecord = await Restaurant_DIne_In_Orders.destroy({ where: { id: cart_items[i].dataValues.id } });
                                if (removeOrderDetailsRecord) {
                                    failed = false;
                                } else {
                                    failed = true;
                                }
                            }
                        }
                        if (failed) {
                            res.status(200).json({
                                status: 400,
                                message: 'Error while processing order!'
                            })
                        } else {
                            res.status(200).json({
                                status: 200,
                                message: "Order cleared successfully!"
                            })
                        }
                    } else {
                        res.status(200).json({
                            status: 400,
                            message: 'Error while processing order!'
                        })
                    }
                } else {
                    res.status(200).json({
                        status: 400,
                        message: 'Error while processing order!'
                    })
                }
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
            message: 'Error while fetching Data'
        })
    }
}
exports.editOrder = async (req, res, next) => {
    try {
        let { restaurant_id, table_id, user_id, dishes } = req.body;
        console.log(req.body)
        if (checkEmpty(restaurant_id) || checkEmpty(table_id) || checkEmpty(user_id)) {
            res.status(200).json({
                status: 409,
                message: 'Please provide all required fields'
            })
        } else {
            let cart_items = await Restaurant_DIne_In_Orders.findAll({ where: { restaurant_id: restaurant_id, user_id: user_id } });
            if (cart_items.length > 0) {
                console.log(cart_items.length)
                let failed = false;
                for (let i = 0; i < cart_items.length; i++) {
                    let remove = await Restaurant_DIne_In_Orders.destroy({ where: { id: cart_items[i].dataValues.id } });
                    if (remove) {
                        failed = false;
                    } else {
                        failed = true;
                    }
                }
                if (failed) {
                    res.status(200).json({
                        status: 400,
                        message: "Error while updating order"
                    })
                } else {
                    let failed_to_add = false;
                    for (let i = 0; i < dishes.length; i++) {
                        let newItem = await Restaurant_DIne_In_Orders.create({
                            user_id,
                            restaurant_id,
                            table_id,
                            dish_id: dishes[i].id,
                            quantity: dishes[i].quantity
                        });
                        if (newItem) {
                            failed_to_add = false;
                        } else {
                            failed_to_add = true;
                        }
                    }
                    if (failed_to_add) {
                        res.status(200).json({
                            status: 400,
                            message: "Error while updating order"
                        })
                    } else {
                        res.status(200).json({
                            status: 200,
                            message: "Order updating successfully!"
                        })
                    }
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: "Error while updating order"
                })
            }
        }
    } catch (err) {
        next(err);
        res.status(200).json({
            status: 400,
            message: 'Error while fetching Data'
        })
    }
}

// -----------------------------functions-----------------------------------------
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
let createNewCustomerInQueue = async (ticket_no, restaurant_id, user_id, persons, family, status) => {
    let new_customer_in_queue = await Restaurant_DIne_In.create({
        ticket_no,
        restaurant_id,
        user_id,
        persons,
        has_family: family,
        status,
        dine_in: new Date().getTime(),
    });

    if (new_customer_in_queue) {
        return new_customer_in_queue.dataValues
    } else {
        return null
    }
}
let assignTicket = async (restaurant_id) => {
    let ticket_count = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
    let ticket_no = 0;
    if (ticket_count.length > 0) {
        ticket_no = ticket_count[ticket_count.length - 1].dataValues.ticket_no + 1;
    }
    return ticket_no
}
let returnAssignedOrderDetails = async (user, res, token, assignedTableToUser, order) => {
    if (order.dataValues.has_family == 1) {
        res.status(200).json({
            status: 200,
            token,
            message: "Login successful",
            user: user,
            table_name: assignedTableToUser.dataValues.name,
            table_assigned: true,
            family_section: true,
            ticket_no: order.dataValues.ticket_no
        })
    } else {
        res.status(200).json({
            status: 200,
            token,
            message: "Login successful",
            user: user,
            table_name: assignedTableToUser.dataValues.name,
            table_assigned: true,
            family_section: false,
            ticket_no: order.dataValues.ticket_no
        })
    }
}
// return assigned ticket when table is not free yet
let ticketAssignedButTableNotFree = async (order, user, token, res) => {
    console.log(order.dataValues)
    if (order.dataValues.has_family == 1) {
        res.status(200).json({
            status: 200,
            token,
            message: "Login successful",
            user: user,
            table_assigned: false,
            table_name: '',
            family_section: true,
            ticket_no: order.dataValues.ticket_no
        })
    } else {
        res.status(200).json({
            status: 200,
            token,
            message: "Login successful",
            user: user,
            table_assigned: false,
            table_name: '',
            family_section: false,
            ticket_no: order.dataValues.ticket_no
        })
    }
}
// assign new table when order already exists
let assignNewTable = async (tables, order, user, token) => {
    let table_toBeAssigned_id = tables[0].dataValues.id;
    let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
    if (table_for_new_user) {
        let assignTableToUser = await Table.update({ ticket_id: order.dataValues.ticket_no, status: 2 },
            {
                where: {
                    id: table_toBeAssigned_id
                }
            })

        if (assignTableToUser) {
            if (order.dataValues.has_family == 1) {
                res.status(200).json({
                    status: 200,
                    token,
                    message: "Login successful",
                    user: user,
                    table_name: table_for_new_user.name,
                    table_assigned: true,
                    family_section: true,
                    ticket_no: order.dataValues.ticket_no
                })
            } else {
                res.status(200).json({
                    status: 200,
                    token,
                    message: "Login successful",
                    user: user,
                    table_name: table_for_new_user.name,
                    table_assigned: true,
                    family_section: false,
                    ticket_no: order.dataValues.ticket_no
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: 'Error while logging!'
            })
        }
    } else {
        res.status(200).json({
            status: 400,
            message: 'Error while logging!'
        })
    }
}
// Assing new ticket but table is not free yet
let assignNewTicketButTableNotFree = async (restaurant_id, user, persons, family, res, token) => {
    let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
    let ticket_no = 0;
    if (forTicketCount.length > 0) {
        ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
    }
    let new_customer_in_queue = await createNewCustomerInQueue(ticket_no, restaurant_id, user.id, persons, family, "in-queue")
    if (new_customer_in_queue == null) {
        res.status(200).json({
            status: 400,
            message: 'Error while logging!'
        })
    } else {
        if (family == 1) {
            res.status(200).json({
                status: 200,
                token,
                message: "Login successful",
                user: user,
                table_assigned: false,
                table_name: '',
                family_section: true,
                ticket_no: new_customer_in_queue.ticket_no
            })
        } else {
            res.status(200).json({
                status: 200,
                token,
                message: "Login successful",
                user: user,
                table_assigned: false,
                table_name: '',
                family_section: false,
                ticket_no: new_customer_in_queue.ticket_no
            })
        }

    }
}
// assign new table when taking new order
let assignTableWithNewOrder = async (res, tables, restaurant_id, user, token, persons, family) => {
    let table_toBeAssigned_id = tables[0].dataValues.id;
    let ticket_no = await assignTicket(restaurant_id);
    let new_customer_in_queue = await createNewCustomerInQueue(ticket_no, restaurant_id, user.id, persons, family, "waiting");
    if (new_customer_in_queue == null) {
        res.status(200).json({
            status: 400,
            message: 'Error while logging!'
        })
    } else {
        let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
        if (table_for_new_user) {
            let assignTableToUser = await Table.update({ ticket_id: new_customer_in_queue.id, status: 2 },
                {
                    where: {
                        id: table_toBeAssigned_id
                    }
                })
            if (assignTableToUser) {
                if (family == 1) {
                    res.status(200).json({
                        status: 200,
                        token,
                        message: "Login successful",
                        user: user,
                        table_name: table_for_new_user.dataValues.name,
                        table_assigned: true,
                        family_section: true,
                        ticket_no: new_customer_in_queue.dataValues.ticket_no
                    })
                } else {
                    res.status(200).json({
                        status: 200,
                        token,
                        message: "Login successful",
                        user: user,
                        table_name: table_for_new_user.dataValues.name,
                        table_assigned: true,
                        family_section: false,
                        ticket_no: new_customer_in_queue.dataValues.ticket_no
                    })
                }
            } else {
                res.status(200).json({
                    status: 400,
                    message: 'Error while logging!'
                })
            }
        } else {
            res.status(200).json({
                status: 400,
                message: 'Error while logging!'
            })
        }

    }
}
// exports.mobileLoginForDineIn = async (req, res, next) => {
//     try {
//         const { customer_number, customer_password, customer_name, persons, family, restaurant_id } = req.body;
//         console.log(req.body);
//         if (checkEmpty(customer_number) || checkEmpty(customer_password) || checkEmpty(customer_name)) {
//             res.status(200).json({
//                 status: 400,
//                 message: 'Please provide all required fields'
//             })
//         } else {
//             if (customer_number.includes('.com')) {
//                 const user = await User.findOne({ where: { email: customer_number } });
//                 if (user) {
//                     let match = await bcrypt.compare(customer_password, user.password);
//                     if (match) {
//                         let token = await accessToken(user);
//                         let tables = await Table.findAll({
//                             where:
//                             {
//                                 restaurant_id: restaurant_id,
//                                 status: 0,
//                                 person_count: persons,
//                                 family: family
//                             }
//                         });
//                         if (tables.length > 0) {
//                             console.log("table is free")
//                             let table_toBeAssigned_id = tables[0].dataValues.id;
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "waiting",
//                                 dine_in: new Date().getTime(),
//                             });
//                             if (new_customer_in_queue) {
//                                 let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
//                                 if (table_for_new_user) {
//                                     let assignTableToUser = await Table.update({ ticket_id: new_customer_in_queue.id, status: 2 },
//                                         {
//                                             where: {
//                                                 id: table_toBeAssigned_id
//                                             }
//                                         })
//                                     if (assignTableToUser) {
//                                         if (family == 1) {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_name: table_for_new_user.name,
//                                                 table_assigned: true,
//                                                 family_section: true,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         } else {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_name: table_for_new_user.name,
//                                                 table_assigned: true,
//                                                 family_section: false,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         }
//                                     } else {
//                                         res.status(200).json({
//                                             status: 400,
//                                             message: 'Error while logging!'
//                                         })
//                                     }
//                                 } else {
//                                     res.status(200).json({
//                                         status: 400,
//                                         message: 'Error while logging!'
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         } else {
//                             console.log("Table is not free")
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "in-queue",
//                             });
//                             if (new_customer_in_queue) {
//                                 if (family == 1) {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: true,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 } else {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: false,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         }
//                     } else {
//                         res.status(200).json({
//                             status: 400,
//                             message: 'Invalid credentials'
//                         })
//                     }
//                 } else {
//                     const salt = await bcrypt.genSalt(10);
//                     const hash = await bcrypt.hash(customer_password, salt);
//                     const user = await User.create({
//                         email: customer_number,
//                         password: hash,
//                         name: customer_name,
//                         role_id: 1
//                     })
//                     if (user) {
//                         let token = await accessToken(user);
//                         let tables = await Table.findAll({
//                             where:
//                             {
//                                 restaurant_id: restaurant_id,
//                                 status: 0,
//                                 person_count: persons,
//                                 family: family
//                             }
//                         });
//                         if (tables.length > 0) {
//                             let table_toBeAssigned_id = tables[0].dataValues.id;
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "waiting",
//                                 dine_in: new Date().getTime(),
//                             });
//                             if (new_customer_in_queue) {
//                                 if (new_customer_in_queue) {
//                                     if (family == 1) {
//                                         res.status(200).json({
//                                             status: 200,
//                                             message: "Login successful",
//                                             token: token,
//                                             user: user,
//                                             table_assigned: false,
//                                             table_name: '',
//                                             family_section: true,
//                                             ticket_no: new_customer_in_queue.ticket_no
//                                         })
//                                     } else {
//                                         res.status(200).json({
//                                             status: 200,
//                                             message: "Login successful",
//                                             token: token,
//                                             user: user,
//                                             table_assigned: false,
//                                             table_name: '',
//                                             family_section: false,
//                                             ticket_no: new_customer_in_queue.ticket_no
//                                         })
//                                     }
//                                 } else {
//                                     res.status(200).json({
//                                         status: 400,
//                                         message: 'Error while logging!'
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         } else {
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "in-queue",
//                             });
//                             if (new_customer_in_queue) {
//                                 if (family == 1) {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: true,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 } else {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: false,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         }
//                     } else {
//                         res.status(200).json({
//                             status: 400,
//                             message: 'Error while logging!'
//                         })
//                     }
//                 }
//             } else {
//                 const user = await User.findOne({ where: { cell: customer_number } });
//                 if (user) {
//                     let match = await bcrypt.compare(customer_password, user.password);
//                     if (match) {
//                         let token = await accessToken(user);
//                         let tables = await Table.findAll({
//                             where:
//                             {
//                                 restaurant_id: restaurant_id,
//                                 status: 0,
//                                 person_count: persons,
//                                 family: family
//                             }
//                         });
//                         if (tables.length > 0) {
//                             let table_toBeAssigned_id = tables[0].dataValues.id;
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "waiting",
//                                 dine_in: new Date().getTime(),
//                             });
//                             if (new_customer_in_queue) {
//                                 let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
//                                 if (table_for_new_user) {
//                                     let assignTableToUser = await Table.update({ ticket_id: new_customer_in_queue.id, status: 2 },
//                                         {
//                                             where: {
//                                                 id: table_toBeAssigned_id
//                                             }
//                                         })
//                                     if (assignTableToUser) {
//                                         if (family == 1) {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_name: table_for_new_user.name,
//                                                 table_assigned: true,
//                                                 family_section: true,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         } else {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_name: table_for_new_user.name,
//                                                 table_assigned: true,
//                                                 family_section: false,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         }
//                                     } else {
//                                         res.status(200).json({
//                                             status: 400,
//                                             message: 'Error while logging!'
//                                         })
//                                     }
//                                 } else {
//                                     res.status(200).json({
//                                         status: 400,
//                                         message: 'Error while logging!'
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         } else {
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "in-queue",
//                             });
//                             if (new_customer_in_queue) {
//                                 if (family == 1) {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: true,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 } else {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         table_name: '',
//                                         family_section: false,
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         }
//                     } else {
//                         res.status(200).json({
//                             status: 400,
//                             message: 'Invalid credentials'
//                         })
//                     }
//                 } else {
//                     const salt = await bcrypt.genSalt(10);
//                     const hash = await bcrypt.hash(customer_password, salt);
//                     const user = await User.create({
//                         cell: customer_number,
//                         password: hash,
//                         name: customer_name,
//                         role_id: 1
//                     })
//                     if (user) {
//                         let token = await accessToken(user);
//                         let tables = await Table.findAll({
//                             where:
//                             {
//                                 restaurant_id: restaurant_id,
//                                 status: 0,
//                                 person_count: persons,
//                                 family: family
//                             }
//                         });
//                         if (tables.length > 0) {
//                             console.log("table_exists")
//                             let table_toBeAssigned_id = tables[0].dataValues.id;
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "waiting",
//                                 dine_in: new Date().getTime(),
//                             });
//                             if (new_customer_in_queue) {
//                                 let table_for_new_user = await Table.findOne({ where: { id: table_toBeAssigned_id } });
//                                 if (table_for_new_user) {
//                                     let assignTableToUser = await Table.update({ ticket_id: new_customer_in_queue.id, status: 2 },
//                                         {
//                                             where: {
//                                                 id: table_toBeAssigned_id
//                                             }
//                                         })
//                                     if (assignTableToUser) {
//                                         if (family == 1) {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_assigned: true,
//                                                 family_section: true,
//                                                 table_name: table_for_new_user.name,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         } else {
//                                             res.status(200).json({
//                                                 status: 200,
//                                                 message: "Login successful",
//                                                 token: token,
//                                                 user: user,
//                                                 table_assigned: true,
//                                                 family_section: false,
//                                                 table_name: table_for_new_user.name,
//                                                 ticket_no: new_customer_in_queue.ticket_no
//                                             })
//                                         }
//                                     } else {
//                                         res.status(200).json({
//                                             status: 400,
//                                             message: 'Error while logging!'
//                                         })
//                                     }
//                                 } else {
//                                     res.status(200).json({
//                                         status: 400,
//                                         message: 'Error while logging!'
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         } else {
//                             let forTicketCount = await Restaurant_DIne_In.findAll({ where: { restaurant_id: restaurant_id } });
//                             let ticket_no = 0;
//                             if (forTicketCount.length > 0) {
//                                 ticket_no = forTicketCount[forTicketCount.length - 1].dataValues.ticket_no + 1;
//                             }
//                             let new_customer_in_queue = await Restaurant_DIne_In.create({
//                                 ticket_no,
//                                 restaurant_id,
//                                 user_id: user.id,
//                                 persons,
//                                 has_family: family,
//                                 status: "in-queue",
//                             });
//                             if (new_customer_in_queue) {
//                                 if (family == 1) {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         family_section: true,
//                                         table_name: '',
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 } else {
//                                     res.status(200).json({
//                                         status: 200,
//                                         message: "Login successful",
//                                         token: token,
//                                         user: user,
//                                         table_assigned: false,
//                                         family_section: false,
//                                         table_name: '',
//                                         ticket_no: new_customer_in_queue.ticket_no
//                                     })
//                                 }
//                             } else {
//                                 res.status(200).json({
//                                     status: 400,
//                                     message: 'Error while logging!'
//                                 })
//                             }
//                         }
//                     } else {
//                         res.status(200).json({
//                             status: 400,
//                             message: 'Error while logging!'
//                         })
//                     }
//                 }
//             }
//         }
//     } catch (err) {
//         next(err);
//         res.status(200).json({
//             status: 400,
//             message: 'Error while logging!'
//         })
//     }
// }
