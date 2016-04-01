"use strict";
var Discern = (function () {
    function Discern() {
        this.DIMENSION = 140;
    }
    Discern.prototype.execute = function (weight, data) {
        if (weight === void 0) { weight = []; }
        if (data === void 0) { data = []; }
        var val = 0;
        if (weight == []) {
            weight = Array.apply(null, new Array(this.DIMENSION));
            weight = weight.map(function () { return 0; });
        }
        data = this.add_bias(data);
        for (var i = 0; i < data.length; i++) {
            val = this.multiply_vector(weight, data);
            if (val === false)
                return false;
        }
        return val;
    };
    Discern.prototype.add_bias = function (data) {
        data.push(1);
        return data;
    };
    Discern.prototype.multiply_vector = function (weight, data) {
        var ret = 0;
        if (weight.length !== data.length)
            return false;
        if (weight == undefined || data == undefined)
            return false;
        for (var i = 0; i < this.DIMENSION; i++) {
            ret += weight[i] * data[i];
        }
        return ret;
    };
    return Discern;
}());
exports.Discern = Discern;
