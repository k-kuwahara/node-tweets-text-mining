var Twitter = require('twitter'),
    mysql   = require('mysql'),
    config  = require('./config');

// create twitter instance
var client = new Twitter({
   consumer_key:        config.consumer_key,
   consumer_secret:     config.consumer_secret,
   access_token_key:    config.access_token_key,
   access_token_secret: config.access_token_secret,
});

// connect mysql
var connection = mysql.createConnection({
   host:     config.host,
   user:     config.user,
   password: config.password,
   database: config.database,
});


