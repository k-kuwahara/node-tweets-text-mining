/// <reference path="../../src/ts/mysql.d.ts" />
/// <reference path="../../src/ts/async.d.ts" />
/// <reference path="../../src/ts/mecab-async.d.ts" />
"use strict";
var mysql = require('mysql');
var async = require('async');
var config = require('./config');
var mod_discern = require('./discern');
var Mecab = require('mecab-async');
var LC = 0.8;
var connection;
var tmp_words;
var weight;
var words;
var mecab = new Mecab();
var test_datas = [
    'やばい！！韓国でマクドナルドを見つけたら飲んでみてください！めっちゃ美味しいです！',
    '【完全決着】「マクドナルドのグランドビッグマック」vs「バーガーキングのビッグキング」本当にウマいのはどっちだ！ http://wp.me/p25BsW-34N0 ',
    '公式垢のアイパス持ってるなら新人でも雑魚でもないと思うんだけど、ずいぶん酷い、最悪なツイートだな(；・∀・) '
];
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
 * learning part
 *
 * @param  void
 * @return any
 */
async.waterfall([
    // get weight values
    function get_weight(callback) {
        connection.query('SELECT * FROM weight_values', function (err, result, fields) {
            if (err)
                result = err;
            weight = result;
            callback(null);
        });
    },
    // get word count
    function get_words(callback) {
        connection.query('SELECT * FROM word_count', function (err, result, fields) {
            if (err)
                result = err;
            words = result;
            tmp_words = words;
            callback(null);
        });
    },
    // learning each tweet
    function learning_tweets(callback) {
        var miss_count = 0;
        var cnt = 0;
        if (test_datas) {
            var loopIndex = 0;
            async.whilst(function () {
                return loopIndex <= test_datas.length;
            }, function (done) {
                // split part
                if (test_datas[loopIndex] != undefined) {
                    async.waterfall([
                        function (callback) {
                            mecab.wakachi(test_datas[loopIndex], function (err, data) {
                                callback(null, data);
                            });
                        },
                        function (split_words, callback) {
                            if (split_words.length > 0 && split_words !== []) {
                                // update classifier
                                train(split_words);
                                callback(null);
                            }
                            else {
                                callback('train');
                            }
                        },
                    ], function (err) {
                        if (err)
                            done('Error: learning miss');
                        else
                            done();
                    });
                    loopIndex++;
                }
            }, function (err) {
                if (err)
                    callback('error');
                else
                    callback(null);
            });
        }
        else {
            callback('no test data');
        }
    },
], function (err) {
    if (err)
        console.log("Error: async waterfall");
    else
        connection.destroy();
});
/**
 * Training
 *
 * @param string[] datas: init datas
 *
 * @return any ret;
 */
var train = function (data) {
    var cnt = 0;
    var val = 0;
    var updated_weight = weight;
    var discern = new mod_discern.Discern();
    async.forever(function (callback) {
        cnt++;
        var miss_count = 0;
        var label;
        async.waterfall([
            function (callback) {
                // get label
                label = get_label(data);
                callback(null, label);
            },
            function (label, callback) {
                // discern
                if (tmp_words[tmp_words.length - 1].id === undefined)
                    tmp_words.pop();
                val = discern.execute(weight, tmp_words);
                // error check
                if (val === false)
                    callback('get val', label);
                else
                    callback(null, label, val);
            },
            function (label, val, callback) {
                // discern
                if (val * label < 0) {
                    updated_weight = update_weight(label);
                    miss_count++;
                    if (updated_weight === false)
                        callback('update weight', miss_count);
                    else
                        callback(null, miss_count);
                }
                callback(null, miss_count);
            },
        ], function (err, miss_count) {
            if (err) {
                callback(err);
            }
            else if (cnt > 100) {
                callback('over flow');
            }
            else if (miss_count !== 0) {
                callback(null);
            }
            else {
                callback('finished');
            }
        });
    }, function (err) {
        if (err === 'finished')
            console.log('training finished');
        else if (err !== null)
            console.error('Error: ' + err);
    });
};
/**
 * get label
 *
 * @param string[]  data : split words
 *
 * @return number ret: label
 */
var get_label = function (data) {
    var ret = 0;
    // initialization
    for (var key in tmp_words) {
        tmp_words[key]['count'] = 0;
    }
    // calculate
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < words.length; j++) {
            if (words[j]['word'] == data[i]) {
                ret += Number(words[j]['label']);
                tmp_words[j]['count']++;
            }
        }
    }
    return ret >= 0 ? 1 : -1;
};
/**
 * Learning part(update weight vector)
 *
 * @param number    label : expect label
 *
 * @return any ret: updated weight vector or false
 */
var update_weight = function (label) {
    var ret = weight;
    console.log('update!!');
    // learning
    for (var i = 0; i < weight.length; i++) {
        ret[i]['weight_num'] = weight[i]['weight_num'] + (LC * label * tmp_words[i]['count']);
        // update weight values in DB
        connection.query('UPDATE weight_values SET weight_num = ? WHERE weight_id = ?', [ret[i], i + 1], function (err, result) {
            if (err)
                ret = false;
        });
        if (i !== weight.length - 1 && tmp_words[i]['count'] !== 0) {
            // update word count in DB
            connection.query('UPDATE word_count SET count = count + 1 WHERE id = ?', [i + 1], function (err, result) {
                if (err)
                    ret = false;
            });
        }
        connection.commit(function (err) {
            if (err)
                ret = false;
        });
    }
    return ret;
};
