const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('Restaurant_Cart', {
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
    size_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    notes: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
});

