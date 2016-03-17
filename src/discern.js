"use strict";
/**
* Calculate identification function y=w^Tx
*
* @param number[] weight: weight vector
* @param number[] data  : input data
*
* @return any ret: result label(number or false)
*/
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
            // calculate vector each other
            val = this.multiply_vector(weight, data);
            // error check
            if (val === false)
                return false;
        }
        return val;
    };
    /**
     * Add bias element for input data
     *
     * @param number[] data: input data
     *
     * @return number[] data: added data
     */
    Discern.prototype.add_bias = function (data) {
        data.push(1);
        return data;
    };
    /**
     * Multiply vector to each other
     *
     * @param number[] weight: weight vector
     * @param number[] data  : input data
     *
     * @return any ret: result val(number or false)
     */
    Discern.prototype.multiply_vector = function (weight, data) {
        // return variable
        var ret = 0;
        // format check
        if (weight.length !== data.length)
            return false;
        // null check
        if (weight == undefined || data == undefined)
            return false;
        // calculate
        for (var i = 0; i < this.DIMENSION; i++) {
            ret += weight[i] * data[i];
        }
        return ret;
    };
    return Discern;
}());
exports.Discern = Discern;
