/// <reference path="./mysql.d.ts" />;

import mysql  = require('mysql');
import config = require('./config');

export class Query
{
   constructor()
   {
      /**
       * Create mysql connection
       *
       * @param  void
       * @return void
       */
      var connection: any = mysql.createConnection({
         host:     config.host,
         user:     config.user,
         password: config.password,
         database: config.database,
      });
    }
}
