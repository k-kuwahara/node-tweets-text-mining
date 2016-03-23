"use strict";
var Twitter = require('twitter');
var config = require('./config');
var discern = require('./discern');
var mod_split = require('./word_split');
var Learning = (function () {
    function Learning() {
        this.DIMENSION = 140;
        this.LC = 0.8;
        var client = new Twitter({
            consumer_key: config.consumer_key,
            consumer_secret: config.consumer_secret,
            access_token_key: config.access_token_key,
            access_token_secret: config.access_token_secret
        });
        client.get('/search/tweets.json', { "q": "#マクドナルド", "count": 100 }, function (err, data) {
            data.statuses.forEach(function (info) {
                var words = mod_split.split(info.text);
                var time = setInterval(function () {
                    if (words.length > 0 && words !== []) {
                        clearInterval(time);
                    }
                }, 500);
            });
        });
    }
    Learning.prototype.train = function (weight, data) {
        if (weight === void 0) { weight = []; }
        var cnt = 0;
        var val = 0;
        var updated_weight = weight;
        while (true) {
            cnt++;
            var miss_count = 0;
            for (var i = 0; i < data.input.length; i++) {
                val = discern.execute(weight, data.input);
                if (val === false)
                    return false;
                if (val * data.label <= 0) {
                    updated_weight = this.update_weight(weight, data.input, data.label);
                    miss_count++;
                }
            }
            if (miss_count == 0)
                break;
            if (cnt > 1000)
                return false;
        }
        return updated_weight;
    };
    Learning.prototype.update_weight = function (weight, data, label) {
        var ret = new Array(this.DIMENSION);
        for (var i = 0; i < this.DIMENSION; i++) {
            ret[i] = weight[i] + (this.LC * label[i] * data[i]);
        }
        return ret;
    };
    return Learning;
}());
var learning = new Learning;
