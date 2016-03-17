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
   private DIMENSION: number = 140;

   public execute(weight: number[] = [], data: number[] = []):any
   {
      var val: any = 0;
      if (weight == []) {
         weight = Array.apply(null, new Array(this.DIMENSION));
         weight = weight.map(() => {return 0;});
      }
      data = this.add_bias(data);
      for (var i: number=0; i<data.length; i++) {
         // calculate vector each other
         val = this.multiply_vector(weight, data);
         // error check
         if (val === false) return false;
      }
      return val;
   }

   /**
    * Add bias element for input data
    *
    * @param number[] data: input data
    *
    * @return number[] data: added data
    */
   private add_bias(data: number[]): number[]
   {
      data.push(1);
      return data;
   }

   /**
    * Multiply vector to each other
    *
    * @param number[] weight: weight vector
    * @param number[] data  : input data
    *
    * @return any ret: result val(number or false)
    */
   private multiply_vector(weight: number[], data: number[]): any
   {
      // return variable
      var ret: number = 0;
      // format check
      if (weight.length !== data.length) return false;
      // null check
      if (weight == undefined || data == undefined) return false;
      // calculate
      for (var i: number=0; i<this.DIMENSION; i++) {
         ret += weight[i] * data[i];
      }
      return ret;
   }
}

