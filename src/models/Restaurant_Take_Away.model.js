const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('restaurant_take_away', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    restaurant_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    user_id: {
        type: Sequelize.BIGINT(255),
        allowNull: false
    },
    ticket_no: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('waiting', 'working', 'ready', 'done'),
        allowNull: false,
        default: 'waiting'
    },
    rating: {
        type: Sequelize.INTEGER(11),
        allowNull: true,
        default: null,
    },
    order_taken: {
        type: Sequelize.DATE,
        allowNull: true
    },
    in_working: {
        type: Sequelize.DATE,
        allowNull: true
    },
    order_ready: {
        type: Sequelize.DATE,
        allowNull: true
    },
    order_served: {
        type: Sequelize.DATE,
        allowNull: true
    },
    done_queue: {
        type: Sequelize.DATE,
        allowNull: true
    },
    remarks: {
        type: Sequelize.STRING(255),
        default: null,
        allowNull: true
    }
});

