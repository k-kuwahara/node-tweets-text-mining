module.exports = function(text) {
   var arrWord = [],
       http    = require('http'),
       parse   = require('xml2js').parseString,
       config  = require('./config');

   var path = '/MAService/V1/parse?appid=' + config.yahoo_id + '&results=ma';
   path   += '&sentence=' + encodeURI(text);

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
               arrWord.push(word.surface);
            });
         });
      });
   }).on('error', function(e) {
      console.log(e.message);
   });
   return arrWord;
};
