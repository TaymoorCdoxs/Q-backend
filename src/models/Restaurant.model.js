const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('restaurant', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        default: 0
    },
    user_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    dine_in: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        default: 0,
    },
    take_away: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        default: 0,
    },
    two_persons: {
        type: Sequelize.BIGINT(20),
        default: null,
    },
    four_persons: {
        type: Sequelize.BIGINT(20),
        default: null,
    },
    total_table: {
        type: Sequelize.BIGINT(20),
        default: null,
    },
    allow: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        default: 0,
    },
    f_two_persons: {
        type: Sequelize.BIGINT(20),
        default: null,
    },
    f_four_persons: {
        type: Sequelize.BIGINT(20),
        default: null,
    },
    no_of_employee: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    }
});

// CREATE TABLE restaurants(
//     id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
//     user_id BIGINT(20) NOT NULL,
//     dine_in TINYINT(1) NOT NULL DEFAULT 0,
//     take_away TINYINT(1) NOT NULL DEFAULT 0,
//     two_persons BIGINT(20) DEFAULT NULL,
//     four_persons BIGINT(20) DEFAULT NULL,
//     total_table BIGINT(20) DEFAULT NULL,
//     allow TINYINT(1) DEFAULT 0,
//     f_two_persons BIGINT(20) DEFAULT NULL,
//     f_four_persons BIGINT(20) DEFAULT NULL,
//     no_of_employee BIGINT(20) NOT NULL,
//     created_at TIMESTAMP NULL DEFAULT NULL,
//     updated_at TIMESTAMP NULL DEFAULT NULL,
//     PRIMARY KEY(id)
// ) ENGINE = INNODB  DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci