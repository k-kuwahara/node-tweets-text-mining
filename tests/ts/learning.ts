/// <reference path="../../src/ts/definitely/mysql.d.ts" />
/// <reference path="../../src/ts/definitely/async.d.ts" />
/// <reference path="../../src/ts/definitely/mecab-async.d.ts" />

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
   "やばい！！韓国でマクドナルドを見つけたら飲んでみてください！めっちゃ美味しいです！",
   "【完全決着】「マクドナルドのグランドビッグマック」vs「バーガーキングのビッグキング」本当にウマいのはどっちだ！ http://wp.me/p25BsW-34N0 ",
   "公式垢のアイパス持ってるなら新人でも雑魚でもないと思うんだけど、ずいぶん酷い、最悪なツイートだな(；・∀・) "
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
            if (test_datas[loopIndex] != undefined) {
               async.waterfall([
                  // split part
                  (callback) =>
                  {
                     mecab.wakachi(test_datas[loopIndex], (err, data) =>
                     {
                        callback(null, data);
                     });
                     loopIndex++;
                  },
                  (split_words, callback) =>
                  {
                     if (split_words.length > 0 && split_words !== []) {
                        // update classifier
                        train(split_words);
                        callback(null);
                     } else {
                        callback('train');
                     }
                  },
               ], (err) =>
               {
                  if (err !== null) done('Error: learning miss');
                  else done();
               });
            } else {
               done('no test data');
            }
         }, (err) =>
         {
            if (err) callback('error');
            else callback(null);
         });
      } else {
         callback('no test data');
      }
   },
], (err) =>
{
   if (err) console.log("Error: async waterfall");
});

/**
 * Training
 *
 * @param string[] datas: init datas
 *
 * @return any ret;
 */
var train = (data: string[]): any =>
{
   var cnt: number = 0;
   var val: any    = 0;
   var updated_weight: any = weight;
   var discern: mod_discern.Discern = new mod_discern.Discern();

   async.forever ((callback: any) =>
   {
      cnt++;
      var miss_count: number = 0;
      var label: number;
      
      async.waterfall([
         (callback) =>
         {
            // get label
            label = get_label(data);
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
               updated_weight = update_weight(label);
               miss_count++;
               if (updated_weight === false) callback('update weight', miss_count);
               else callback(null, miss_count);
            }
            callback(null, miss_count);
         },
      ], (err, miss_count) =>
      {
         if (err) callback(err);
         else if (cnt > 10000) callback('over flow');
         else if (miss_count !== 0) callback(null);
         else callback('finished');
      });
   }, (err: any) =>
   {
      if (err === 'finished') console.log('training finished');
      else if (err !== null) console.error('Error: ' + err);
   });
}


/**
 * get label
 * 
 * @param string[]  data : split words
 *
 * @return number ret: label
 */
var get_label = (data: string[]): number =>
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
 * @param number    label : expect label
 *
 * @return any ret: updated weight vector or false
 */
var update_weight = (label: number): any =>
{
   var ret: any = weight;
   // learning
   for (var i: number = 0; i<weight.length; i++) {
      ret[i]['weight_num'] = weight[i]['weight_num'] + (LC * label * tmp_words[i]['count']);

      // update weight values in DB
      connection.query('UPDATE weight_values SET weight_num = ? WHERE weight_id = ?', [ret[i], i+1], (err, result) =>
      {
         if (err) ret = false;
      });

      if (i !== weight.length-1 && tmp_words[i]['count'] !== 0) {
         // update word count in DB
         connection.query('UPDATE word_count SET count = count + 1 WHERE id = ?', [i+1], (err, result) =>
         {
            if (err) ret = false;
         });
      }
   }

   return ret;
}
