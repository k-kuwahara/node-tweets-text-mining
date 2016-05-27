/// <reference path="../ts/definitely/node.d.ts" />
/// <reference path="../ts/definitely/mysql.d.ts" />
/// <reference path="../ts/definitely/async.d.ts" />
/// <reference path="../ts/definitely/mecab-async.d.ts" />

import fs     = require('fs');
import qs     = require('querystring');
import config = require('./config');
import mysql  = require('mysql');
import async  = require('async');
import Mecab  = require('mecab-async');

var connection: any;
var weight    : any;
var mecab     : Mecab.MecabAPI = new Mecab();
var query     : string = process.argv[2];
var result    : any;

/**
 * Create mysql connection
 *
 * @param  void
 * @return void
 */
connection = mysql.createConnection({
   host:     config.host,
   user:     config.user,
   password: config.password,
   database: config.database,
});

/**
 * classify part
 * 
 * @param  void
 * @return any
 */
async.waterfall([
   // get weight
   (done) =>
   {
      var sql: string = 'select wc.*, wv.weight_num  from word_count as wc left join weight_values as wv on wc.id = wv.weight_id';
      connection.query(sql, (err, result, fields) =>
      {
         if (err) result = err;
         weight = result;
         done(null, weight);
      });
   },

   // split text
   (weight, done) =>
   {
      mecab.wakachi(query, (err, data) =>
      {
         if (err) {
            done(err);
         } else {
            result = discern(weight, data);
            result = result >= 0 ? 'positive sentences!!' : 'negative sentences!!';
            done(null, result);
         }
      });
   }
], (err, value) =>
{
   if (err) {console.error("Error: async waterfall");}
   else {console.log(value);connection.end();}
});

/**
 * discern part
 *
 * @param weight: string[] weight vector
 * @param words : string[] split text
 * @return result: number or false
 */
function discern(weight: string[], words: string[])
{
   var result: any = 0;
   words.forEach((word: string, index: number) =>
   {
      weight.forEach((elem: any, key: number) =>
      {
         if (word === elem.word) result += parseInt(elem.weight_num)* parseInt(elem.label);
      });
   });

   return result;
}
