/// <reference path="../ts/node.d.ts" />
/// <reference path="../ts/xml2js.d.ts" />

import config = require('./config');
import http   = require('http');
import xml2js = require('xml2js');

export function split(text: string): string[] {
   var words: string[] = [];
   var parse = xml2js.parseString;

   var path = '/MAService/V1/parse?appid=' + config.yahoo_id + '&results=ma';
   path    += '&sentence=' + encodeURI(text);

   var options = {
      host: 'jlp.yahooapis.jp',
      path: path,
      method: 'GET'
   };

   http.get(options, (res) => {
      res.setEncoding('utf8');
      res.on('error', (e) => {
         words.push('error');
      });
      res.on('data', (data) => {
         parse(data, (err, result) => {
            if (!err || result !== undefined) {
               result.ResultSet.ma_result[0].word_list[0].word.forEach(function(word) {
                  words.push(word.surface[0]);
               });
            } else {
               words.push('error');
            }
         });
      });
   }).on('error', (e) => {
      words.push('error');
   });
   return words;
}
