/// <reference path="../ts/definitely/node.d.ts" />
/// <reference path="../ts/definitely/twitter.d.ts" />
/// <reference path="../ts/definitely/mysql.d.ts" />
/// <reference path="../ts/definitely/async.d.ts" />
/// <reference path="../ts/definitely/mecab-async.d.ts" />

import fs          = require('fs');
import Twitter     = require('twitter');
import mysql       = require('mysql');
import async       = require('async');
import config      = require('./config');
import mod_discern = require('./discern');
import Mecab       = require('mecab-async');

var LC        : number = 0.8;
var client    : Twitter.TwitterClient;
var connection: any;
var tmp_words : any;
var weight    : any;
var words     : any;
var mecab     : Mecab.MecabAPI = new Mecab();

/**
 * Create twitter instance
 *
 * @param  void
 * @return void
 */
client = new Twitter({
   consumer_key:        config.consumer_key,
   consumer_secret:     config.consumer_secret,
   access_token_key:    config.access_token_key,
   access_token_secret: config.access_token_secret
});

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
         words     = result;
         tmp_words = result;
         callback(null);
      });
   },

   // get tweets by TwitterAPI
   function get_tweets(callback)
   {
      var tweets: any;
      // search by key word
      // ※only japanese text
      client.get('/search/tweets.json', {"q":"マクドナルド", "count": 3}, (err, data) =>
      {
         if (err) data = err;
         tweets = data;
         callback(null, tweets);
      });
   },

   // learning each tweet
   function learning_tweets(tweets, callback)
   {
      if (tweets) {
         var loopIndex = 0;
         async.whilst(() =>
         {
            return loopIndex < tweets.statuses.length;
         }, (done: any) =>
         {
            if (tweets.statuses[loopIndex] != undefined) {
               async.waterfall([
                  // split part
                  (callback) =>
                  {
                     mecab.wakachi(tweets.statuses[loopIndex].text, (err, data) =>
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
                  if (err != null) done('Error: learning miss');
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
   else connection.destroy();
});


/**
 * Training
 *
 * @param string[] datas: split words
 *
 * @return any ret;
 */
var train = (data: string[] = []): any =>
{
   var cnt: number = 0;
   var val: any    = 0;
   var updated_weight: any = weight;
   var discern: mod_discern.Discern = new mod_discern.Discern();

   async.forever((callback: any) =>
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
            fs.writeFile('weight.json', JSON.stringify(weight, null, ''));

            // error check
            if (val === false) callback('get val', label);
            else callback(null, label, val);
         },
         (label, val, callback) =>
         {
            // discern
            if (val * label < 0) {
               updated_weight = update_weight(weight, words, label);
               fs.writeFile('weight.json', JSON.stringify(updated_weight, null, ''));
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
         else if (miss_count !== 0) callback();
         else callback('finished');
      });
   }, (err: any) =>
   {
      if (err === 'finished') console.log('training finished');
      else if (err !== null) console.log('Error: ' + err);
   });
}


/**
 * get label
 * 
 * @param string[]  data : learning data
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
      ret[i] = weight[i]['weight_num'] + (LC * label * tmp_words[i]['count']);
   }

   // update weight values in DB
   connection.query('UPDATE weight_values SET weight_num = ? WHERE weight_id = ?', (ret[i], i), (err, result, fields) : void =>
   {
      if (err) ret = false;
   });

   return ret;
}
