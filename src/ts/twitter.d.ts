/// <reference path="./node.d.ts" />

declare module "twitter" {
   export class Twitter {
      constructor(
         options: {
            consumer_key       : string,
            consumer_secret    : string,
            access_token_key   : string,
            access_token_secret: string
         }
      );

      get(
         url     : string,
         params  : any,
         callback: (error: Error, data: any) => any
      ): any;
   }
}
