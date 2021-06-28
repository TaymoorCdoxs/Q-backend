const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('insurance', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    insurance_number: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    }
});