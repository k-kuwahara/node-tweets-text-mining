/// <reference path="../../src/ts/definitely/node.d.ts" />
/// <reference path="../../src/ts/definitely/mysql.d.ts" />
/// <reference path="../../src/ts/definitely/async.d.ts" />
/// <reference path="../../src/ts/definitely/mecab-async.d.ts" />
"use strict";
var config = require('./config');
var mysql = require('mysql');
var async = require('async');
var Mecab = require('mecab-async');
var connection;
var weight;
var mecab = new Mecab();
var result;
var test_sentences = "やばい！！韓国でマクドナルドを見つけたら飲んでみてください！めっちゃ美味しいです！";
// "【完全決着】「マクドナルドのグランドビッグマック」vs「バーガーキングのビッグキング」本当にウマいのはどっちだ！ http://wp.me/p25BsW-34N0 ";
// "公式垢のアイパス持ってるなら新人でも雑魚でもないと思うんだけど、ずいぶん酷い、最悪なツイートだな(；・∀・) ";
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
        mecab.wakachi(test_sentences, function (err, data) {
            if (err) {
                done(err);
            }
            else {
                result = discern(weight, data);
                result = result >= 0 ? 'test ok!!' : 'test ng!!';
                done(null, result);
            }
        });
    }
], function (err, value) {
    if (err) {
        console.error("Error: async waterfall");
    }
    else {
        console.log(value);
        connection.end();
    }
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
            if (word === elem.word)
                result += parseInt(elem.weight_num);
        });
    });
    return result;
}
