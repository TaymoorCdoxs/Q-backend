const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('size_and_type', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    price: {
        type: Sequelize.BIGINT(255),
        allowNull: false,
    },
    dish_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    available: {
        type: Sequelize.TINYINT(1),
        default: 1
    },
});