/// <reference path="./node.d.ts" />
/// <reference path="./xml2js.d.ts" />

import config = require('./config');
import http   = require('http');
import xml2js = require('xml2js');

export function split(text: string): string[]
{
  var words: string[] = [];
  var parse = xml2js.parseString;

  var path = '/MAService/V1/parse?appid=' + config.yahoo_id + '&results=ma';
  path    += '&sentence=' + encodeURI(text);

  var options = {
     host: 'jlp.yahooapis.jp',
     path: path,
     method: 'GET'
  };

  http.get(options, function(res) {
     res.setEncoding('utf8');
     res.on('data', function(data) {
        parse(data, function(err, result) {
           result.ResultSet.ma_result[0].word_list[0].word.forEach(function(word) {
              words.push(word.surface);
           });
        });
     });
  }).on('error', function(e) {
     console.log(e.message);
  });
  return words;
}
