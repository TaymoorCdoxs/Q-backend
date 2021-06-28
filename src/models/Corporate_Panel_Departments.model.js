const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('corporate_panel_department', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    corporate_panel_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false
    },
    parent_id: {
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
        type: Sequelize.TEXT,
        allowNull: true,
        default: null
    }
});