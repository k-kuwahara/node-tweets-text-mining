declare module Mecab {
   export class MecabAPI {
      constructor();

      parse(
         text: string,
         callback: (error: Error, data: string[][]) => any
      ): MecabAPI;

      wakachi(
         text: string,
         callback: (error: Error, data: string[]) => any
      ): MecabAPI;
   }
}

declare module "mecab-async" {
   var ma: typeof Mecab.MecabAPI;
   export = ma;
}
