const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('category', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    restaurant_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    image: {
        type: Sequelize.STRING(255),
        allowNull: false
    }
});