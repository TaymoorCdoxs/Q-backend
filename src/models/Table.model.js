const Sequelize = require('sequelize');
var sequelize = require('../database/connection');

module.exports = sequelize.define('table', {
    id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING(255),
        allowNull: true,
        default: null,
    },
    restaurant_id: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    person_count: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
    },
    ticket_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    },
    status: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        default: 1
    },
    family: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        default: 0,
    },
    employee_id: {
        type: Sequelize.BIGINT(20),
        allowNull: true,
        default: null,
    }
});


// CREATE TABLE tables(
//     id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
//     name VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
//     restaurant_id BIGINT(20) NOT NULL,
//     person_count BIGINT(20) NOT NULL,
//     status INT(11) NOT NULL DEFAULT 1,
//     ticket_id BIGINT(20) DEFAULT NULL,
//     faimly TINYINT(1) NOT NULL DEFAULT 0,
//     employee_id BIGINT(20) DEFAULT NULL,
//     created_at TIMESTAMP NULL DEFAULT NULL,
//     updated_at TIMESTAMP NULL DEFAULT NULL,
//     PRIMARY KEY(id)
// ) ENGINE = INNODB  DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci