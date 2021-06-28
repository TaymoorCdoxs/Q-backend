const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('service', {
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
    department_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    corporate_panel_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    max_allowed: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
    },
    status: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        default: 0
    },
    employee_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    },
    ticket_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    },
    image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null
    },
    description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null
    },
    service_charges: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null
    },
    estimated_time: {
        type: Sequelize.BIGINT(255),
        allowNull: false,
        default: 0
    }
});