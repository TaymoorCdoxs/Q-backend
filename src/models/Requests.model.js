const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('request', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    branch_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    business_type_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
    },
    business_type_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    latitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    longitude: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    package_duration: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    package_start: {
        type: Sequelize.DATE,
    },
    package_end: {
        type: Sequelize.DATE,
    },
    status: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    remarks: {
        type: Sequelize.STRING(3000),
        allowNull: true,
        default: null,
    },
});

