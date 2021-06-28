const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('Restaurant_Cart_Extra', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    cart_item_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    extra_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    quantity: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
});

