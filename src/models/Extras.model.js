const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('extra', {
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
    restaurant_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    available: {
        type: Sequelize.TINYINT(1),
        default: 1
    },
});