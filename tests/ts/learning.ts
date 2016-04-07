/// <reference path="../../src/ts/mysql.d.ts" />
/// <reference path="../../src/ts/async.d.ts" />
/// <reference path="../../src/ts/mecab-async.d.ts" />

import mysql       = require('mysql');
import async       = require('async');
import config      = require('./config');
import mod_discern = require('./discern');
import Mecab       = require('mecab-async');

var LC        : number = 0.8;
var connection: any;
var tmp_words : any;
var weight    : any;
var words     : any;
var mecab     : Mecab.MecabAPI = new Mecab();
var test_datas: string[] = [
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
   host:     config.host,
   user:     config.user,
   password: config.password,
   database: config.database,
});

/**
 * learning part
 * 
 * @param  void
 * @return any
 */
async.waterfall([
   // get weight values
   function get_weight(callback)
   {
      connection.query('SELECT * FROM weight_values', (err, result, fields) =>
      {
         if (err) result = err;
         weight = result;
         callback(null);
      });
   },

   // get word count
   function get_words(callback)
   {
      connection.query('SELECT * FROM word_count', (err, result, fields) : void =>
      {
         if (err) result = err;
         words = result;
         tmp_words = words;
         callback(null);
      });
   },

   // learning each tweet
   function learning_tweets(callback)
   {
      if (test_datas) {
         var loopIndex = 0;
         async.whilst(() =>
         {
            return loopIndex < test_datas.length;
         }, (done: any) =>
         {
            // split part
            if (test_datas[loopIndex] != undefined) {
               async.waterfall([
                  (callback) =>
                  {
                     mecab.wakachi(test_datas[loopIndex], (err, data) =>
                     {
                        var split_words: string[] = data;
                        callback(null, split_words);
                     });
                  },
                  (split_words, callback) =>
                  {
                     loopIndex++;
                     if (split_words.length > 0 && split_words !== [] && split_words[0] !== 'error') {
                        // update classifier
                        train(weight, words, split_words);
                        callback(null);
                     } else {
                        callback('train');
                     }
                  },
               ], (err) =>
               {
                  if (err) done('Error: learning miss');
                  else done();
               });
            }
         }, (err) =>
         {
            if (err) callback('error');
         });
      }
      callback(null);
      // process.exit(0);
   },
], (err) =>
{
   if (err) console.log("Error: async waterfall");
});


/**
 * Training
 *
 * @param number[] weight: weight vector
 * @param object[] words:  words count
 * @param string[] data:   split words
 *
 * @return any ret;
 */
var train = (weight: number[] = [], words: any[] = [], data: string[] = []): any =>
{
   var cnt: number = 0;
   var val: any    = 0;
   var updated_weight: any = weight;
   var discern: mod_discern.Discern = new mod_discern.Discern();

   async.whilst(() =>
   {
      return true;
   }, (done: any) =>
   {
      cnt++;
      var miss_count: number = 0;
      var label: number;
      
      async.waterfall([
         (callback) =>
         {
            // get label
            label = get_label(words, data);
            callback(null, label);
         },
         (label, callback) =>
         {
            // discern
            if (tmp_words[tmp_words.length-1].id === undefined) tmp_words.pop();
            val = discern.execute(weight, tmp_words);

            // error check
            if (val === false) callback('get val', label);
            else callback(null, label, val);
         },
         (label, val, callback) =>
         {
            // discern
            if (val * label < 0) {
               updated_weight = update_weight(weight, words, label);
               miss_count++;
               if (updated_weight === false) callback('update weight', miss_count);
               else callback(null, miss_count);
            }
            callback(null, miss_count);
         },
      ], (err, miss_count) =>
      {
         if (err) {done(err);}
         else if (cnt > 10) {done('over flow');}
         else if (miss_count !== 0) {done();}
         else {done('finished');}
      });
   }, (err) =>
   {
      if (err === 'finished') {console.log('training finished');}
      else console.error('Error: ' + err);
   });
}


/**
 * get label
 * 
 * @param object[]  words: words count
 * @param string[]  data : learning data
 *
 * @return number ret: label
 */
var get_label = (words: any[], data: string[]): number =>
{
   var ret: number = 0;

   // initialization
   for (var key in tmp_words) {
      tmp_words[key]['count'] = 0;
   }

   // calculate
   for (var i: number=0; i<data.length; i++) {
      for (var j: number=0; j<words.length; j++) {
         if (words[j]['word'] == data[i]) {
            ret += Number(words[j]['label']);
            tmp_words[j]['count']++;
         }
      }
   }

   return ret >= 0 ? 1 : -1;
}

/**
 * Learning part(update weight vector)
 *
 * @param number[]  weight: weight vector
 * @param string[]  data  : split words
 * @param number    label : expect label
 *
 * @return any ret: updated weight vector or false
 */
var update_weight = (weight: number[], data: number[], label: number): any =>
{
   var ret: any = new Array(weight.length);
   
   // learning
   for (var i: number = 0; i<weight.length; i++) {
      ret[i] = weight[i]['value'] + (LC * label * tmp_words[i]['count']);

      // update weight values in DB
      connection.query('UPDATE weight_values SET value = ? WHERE weight_id = ?', [ret[i], i], (err, result) =>
      {
         if (err) ret = false;
      });
   }

   return ret;
}