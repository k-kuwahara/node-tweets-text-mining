/// <reference path="../ts/definitely/node.d.ts" />

import discern = require('./discern');

export class Simple_perceptron
{
   private DATA_COUNT: number = 100;
   private DIMENSION : number = 140;
   private LOOP_MAX  : number = 1000;

   /**
    * Create weight vector
    *
    * @param  void
    * @return void
    */
   constructor()
   {
      var weight: number[] = new Array(this.DIMENSION);
      for (var i: number=0; i<this.DIMENSION; i++) {
         weight[i] = Math.random();
      }
   }
}

