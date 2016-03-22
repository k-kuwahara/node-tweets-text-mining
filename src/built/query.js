var mysql = require('mysql');
var config = require('./config');
var Query = (function () {
    function Query() {
        var connection = mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database
        });
    }
    return Query;
}());
exports.Query = Query;
