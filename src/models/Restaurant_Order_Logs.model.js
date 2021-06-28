const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('restaurant_orders_logs', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    restaurant_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    order_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    dish_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    quantity: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    notes: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    }
});

