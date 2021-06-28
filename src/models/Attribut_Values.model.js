const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('Attribute_Value', {
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
    attribute_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    price: {
        type: Sequelize.BIGINT(255),
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
});