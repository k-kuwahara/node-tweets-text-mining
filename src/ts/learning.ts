/// <reference path="./twitter.d.ts" />

import Twitter = require('twitter');
import query   = require('./query');
import config  = require('./config');
import discern = require('./discern');
import mod_split   = require('./word_split');

// data model
interface Lerning_data
{
   input: number[];
   label: number;
}

class Learning
{
   private DIMENSION: number = 140;
   private LC       : number = 0.8;

   constructor()
   {
      /**
       * Create twitter instance
       *
       * @param  void
       * @return void
       */
      var client:any = new Twitter({
         consumer_key:        config.consumer_key,
         consumer_secret:     config.consumer_secret,
         access_token_key:    config.access_token_key,
         access_token_secret: config.access_token_secret,
      });

      // search by key word
      // ※only japanese text
      client.get('/search/tweets.json', {"q":"#マクドナルド", "count": 100}, (err, data) => {
         data.statuses.forEach((info) => {
            var words:string[] = mod_split.split(info.text);
            var time:any = setInterval(() => {
               if (words.length > 0 && words !== []) {
                  clearInterval(time);
               }
            }, 500);
         });
      });
   }

   /**
    * Training
    *
    * @param number[] weight  : weight vector
    * @param Lerning_data data: input data
    *
    * @return any updated_weight: updated weight vector
    */
   private train(weight: number[] = [], data: Lerning_data): any
   {
      var cnt: number = 0;
      var val: any    = 0;
      var updated_weight: number[] = weight;
      while (true) {
         cnt++;
         var miss_count: number = 0;
         for (var i: number=0; i<data.input.length; i++) {
            // identification
            val = discern.execute(weight, data.input);
            // error check
            if (val === false) return false;
            // discern
            if (val * data.label <= 0) {
               updated_weight = this.update_weight(weight, data.input, data.label);
               miss_count++;
            }
         }
         if (miss_count == 0) break;
         if (cnt > 1000) return false;   // is not convergent
      }
      return updated_weight;
   }

   /**
    * Learning part(update weight vector)
    *
    * @param number[]  weight: weight vector
    * @param number[]  data  : learning data
    * @param number    label : expect label
    *
    * @return number[] ret   : updated weight vector
    */
   public update_weight(weight: number[], data: number[], label: number): number[]
   {
      var ret: number[] = new Array(this.DIMENSION);
      // learning
      for(var i: number=0; i<this.DIMENSION; i++) {
         ret[i] = weight[i] + (this.LC * label[i] * data[i]);
      }
      return ret;
   }
}

var learning:Learning = new Learning;
