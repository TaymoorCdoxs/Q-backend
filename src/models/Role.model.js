const Sequelize = require('sequelize');
var sequelize = require('../database/connection'); 

module.exports = sequelize.define('role', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name : {
        type: Sequelize.STRING(255),
        allowNull : false,
    }
});