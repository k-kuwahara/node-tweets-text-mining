/// <reference path="./mysql.d.ts" />

import mysql  = require('mysql');
import config = require('./config');

export class Query
{
   connection:any;
   constructor()
   {
      /**
       * Create mysql connection
       *
       * @param  void
       * @return void
       */
      this.connection = mysql.createConnection({
         host:     config.host,
         user:     config.user,
         password: config.password,
         database: config.database,
      });
   }

   public get_weight(): any {
      this.connection.query('SELECT * FROM weight_values', (err, result, fields) => {
         return result;
      });
   }

   public get_word_count(): any {
      this.connection.query('SELECT * FROM word_count', (err, result, fields) => {
         return result;
      });
   }
}
