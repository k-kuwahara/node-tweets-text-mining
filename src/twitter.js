var Twitter = require('twitter'),
    config  = require('./config');

// create twitter instance
var client = new Twitter({
   consumer_key:        config.consumer_key,
   consumer_secret:     config.consumer_secret,
   access_token_key:    config.access_token_key,
   access_token_secret: config.access_token_secret,
});

//キーワード検索
client.get('/search/tweets.json', {"q":"#モスバーガー", "count": 3}, function(err, data) {
   data.statuses.forEach(function(info) {
       console.log(info.user.profile_image_url);
   });
});
