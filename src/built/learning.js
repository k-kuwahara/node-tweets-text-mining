"use strict";
var twitter_1 = require('twitter');
var config = require('./config');
var discern = require('./discern');
var Learning = (function () {
    function Learning() {
        this.DIMENSION = 140;
        this.LC = 0.8;
        var client = new twitter_1["default"]({
            consumer_key: config.consumer_key,
            consumer_secret: config.consumer_secret,
            access_token_key: config.access_token_key,
            access_token_secret: config.access_token_secret
        });
        client.get('/search/tweets.json', { "q": "#typescript", "count": 100 }, function (err, data) {
            data.statuses.forEach(function (info) {
                if (info.text.match(/^[ぁ-んァ-ン一-龠]+$/)) {
                    console.log(info.text);
                }
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
                val = discern.index(weight, data.input);
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
