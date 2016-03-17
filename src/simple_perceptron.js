/// <reference path="node.d.ts" />
"use strict";
var simple_perceptron = (function () {
    /**
     * Create weight vector
     *
     * @param  void
     * @return void
     */
    function simple_perceptron() {
        this.DATA_COUNT = 100;
        this.DIMENSION = 140;
        this.LOOP_MAX = 1000;
        this.weight = new Array(DIMENSION);
        for (var i = 0; i < DIMENSION; i++) {
            this.weight[i] = Math.random();
        }
    }
    /**
     * Add bias element for input data
     *
     * @param  Array data: input data
     * @return Array data: added data
     */
    simple_perceptron.prototype.add_bias = function (data) {
        data.push(1);
        return data;
    };
    /**
     * Calculate identification function y=w^Tx
     *
     * @param Array weight: weight vector
     * @param Array data  : input data
     * @param Array label : expect label
     *
     * @return Array [ret, $val] result label,value
     */
    simple_perceptron.prototype.discern = function (weight, data, label) {
        if (weight === void 0) { weight = ''; }
        if (data === void 0) { data = ''; }
        if (label === void 0) { label = ''; }
        cnt: number = 0;
        updated_weight: number[] = [];
        if (weight == '')
            weight = array_fill(0, DIMENSION + 1, 0);
        while (true) {
            cnt++;
            miss_count = 0;
            for (var i = 0; i < data.length; i++) {
                // calculate vector each other
                val = multiply_vector(weight, add_bias(data[i]));
                // error check
                if (val === false)
                    return false;
                // identify
                if (val * label[$key] <= 0) {
                    weight = update_weight(weight, add_bias(data[i]), label[i]);
                    $miss_count++;
                }
            }
            if ($miss_count == 0)
                break;
            if ($cnt > 1000)
                return false; // is not convergent
        }
        return weight;
    };
    /**
     * Multiply vector to each other
     *
     * @param Array weight weight vector
     * @param Array data   input data
     *
     * @return Int ret result
     */
    simple_perceptron.prototype.multiply_vector = function (weight, data) {
        // return variable
        ret: number = 0;
        // format check
        if (weight.length != data.length)
            return false;
        // null check
        if (weight == '' || data == '')
            return false;
        // calculate
        for (var i = 0; i < DIMENSION; i++) {
            ret += weight[i] * data[i];
        }
        return ret;
    };
    return simple_perceptron;
}());
