var Twitter   = require('twitter'),
    config    = require('./config');

// create twitter instance
var client = new Twitter({
   consumer_key:        config.consumer_key,
   consumer_secret:     config.consumer_secret,
   access_token_key:    config.access_token_key,
   access_token_secret: config.access_token_secret,
});

// search by key word
// ※only japanese text
client.get('/search/tweets.json', {"q":"", "count": 100}, function(err, data) {
   data.statuses.forEach(function(info) {
      if (info.text.match(/^[ぁ-んァ-ン一-龠]+$/)) {
//      if (info.text.match(/^[\p{Han}\p{Hiragana}\p{Katakana}]$/)) {
         console.log(info.text);
      }
   });
});
