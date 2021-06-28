const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('user', {
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
    email: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    email_verified_at: {
        type: Sequelize.DATE,
    },
    password: {
        type: Sequelize.STRING,
    },
    role_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        validate: {
            notEmpty: true
        },
    },
    device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
        validate: {
            notEmpty: false
        },
        device_id: {
            type: Sequelize.STRING(255),
        }
    },
    address: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
        validate: {
            notEmpty: false
        }
    },
    cell: {
        type: Sequelize.STRING(20),
        allowNull: true,
        default: null,
        validate: {
            notEmpty: false
        }
    },
    image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
        validate: {
            notEmpty: false
        }
    },
    remember_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
        validate: {
            notEmpty: false
        }
    },
    email_verified_at: {
        type: Sequelize.DATE,
        allowNull: true,
        default: null,
        validate: {
            notEmpty: true
        }
    },
    gender: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    }
});