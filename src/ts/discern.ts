/// <reference path="./node.d.ts" />;

/**
* Calculate identification function y=w^Tx
*
* @param number[] weight: weight vector
* @param number[] data  : input data
*
* @return any ret: result label(number or false)
*/
export class Discern
{
   /**
    * Calculate two vectors
    *
    * @param number[] weight: weight vector
    * @param string[] data  : tmp word count
    *
    * @return any val: result calc(number or false)
    */
   public execute(weight: number[] = [], data: string[] = []): any
   {
      var val: any = 0;
      if (weight === []) {
         weight = Array.apply(null, new Array(data.length));
         weight = weight.map(() => {return 0;});
      }

      // calculate vector each other
      val = this.multiply_vector(weight, this.add_bias(data));

      // error check
      if (val === false) return false;

      return val;
   }

   /**
    * Add bias element for input data
    *
    * @param string[] data: input data
    *
    * @return number[] data: added data
    */
   private add_bias(data: any[]): string[]
   {
      data.push({'count': '1'});
      return data;
   }

   /**
    * Multiply vector to each other
    *
    * @param number[] weight: weight vector
    * @param string[] data  : tmp word count
    *
    * @return any ret: result val(number or false)
    */
   private multiply_vector(weight: number[], data: string[]): any
   {
      // return variable
      var ret: number = 0;

      // format check
      if (weight.length !== data.length) return false;

      // null check
      if (weight == undefined || data == undefined) return false;

      // calculate
      for (var key in data) {
         ret += weight[key]['value'] * Number(data[key]['count']);
      }

      return ret;
   }
}
