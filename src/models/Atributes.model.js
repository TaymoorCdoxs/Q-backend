const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('Attribute', {
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
    dish_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
});