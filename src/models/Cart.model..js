const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('cart', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    dish_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    }
});