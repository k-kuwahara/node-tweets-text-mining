/// <reference path="../ts/definitely/node.d.ts" />
/// <reference path="../ts/definitely/mysql.d.ts" />
/// <reference path="../ts/definitely/async.d.ts" />
/// <reference path="../ts/definitely/mecab-async.d.ts" />
"use strict";
var config = require('./config');
var mysql = require('mysql');
var async = require('async');
var Mecab = require('mecab-async');
var connection;
var weight;
var mecab = new Mecab();
var query = process.argv[2];
var result;
/**
 * Create mysql connection
 *
 * @param  void
 * @return void
 */
connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});
/**
 * classify part
 *
 * @param  void
 * @return any
 */
async.waterfall([
    // get weight
    function (done) {
        var sql = 'select wc.*, wv.weight_num  from word_count as wc left join weight_values as wv on wc.id = wv.weight_id';
        connection.query(sql, function (err, result, fields) {
            if (err)
                result = err;
            weight = result;
            done(null, weight);
        });
    },
    // split text
    function (weight, done) {
        mecab.wakachi(query, function (err, data) {
            if (err) {
                done(err);
            }
            else {
                result = discern(weight, data);
                done(null);
            }
        });
    }
], function (err, values) {
    if (err)
        console.error("Error: async waterfall");
    else
        console.log("classify!!");
});
/**
 * discern part
 *
 * @param weight: string[] weight vector
 * @param words : string[] split text
 * @return result: number or false
 */
function discern(weight, words) {
    var result = 0;
    words.forEach(function (word, index) {
        weight.forEach(function (elem, key) {
            console.log(elem);
        });
    });
}
