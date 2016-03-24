"use strict";
var mysql = require('mysql');
var config = require('./config');
var Query = (function () {
    function Query() {
        this.connection = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }
    Query.prototype.get_weight = function () {
        this.connection.query('SELECT * FROM weight_values', function (err, result, fields) {
            return result;
        });
    };
    Query.prototype.get_word_count = function () {
        this.connection.query('SELECT * FROM word_count', function (err, result, fields) {
            return result;
        });
    };
    return Query;
}());
exports.Query = Query;
