/// <reference path="./node.d.ts" />

declare module Twitter {
   interface AuthInfo {
      consumer_key       : string;
      consumer_secret    : string;
      access_token_key   : string;
      access_token_secret: string;
   }
   export class TwitterClient {
      constructor(auth: AuthInfo);
      get(
         url     : string,
         params  : any,
         callback: (error: Error, data: any) => any
      ):TwitterClient;
   }
}

declare module "twitter" {
   var tw: typeof Twitter.TwitterClient;
   export = tw;
}