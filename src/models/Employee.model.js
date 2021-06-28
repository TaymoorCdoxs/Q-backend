const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('employee', {
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
    panel_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    corporate_panel_department_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    },
    service_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    },
    status: {
        type: Sequelize.TINYINT(1),
        default: 0
    },
    speciality: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null
    },
    education: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null
    },
    max_allowed: {
        type: Sequelize.BIGINT(100),
        default: 0,
    }
});