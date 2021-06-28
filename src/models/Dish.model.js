const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('dish', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    category_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    price: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    image: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    estimated_time: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    }
});