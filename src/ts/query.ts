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
      var connection = mysql.createConnection({
         host:     config.host,
         user:     config.user,
         password: config.password,
         database: config.database,
      });
   }

   public get_weight(): number[] {
      this.connection.query('SELECT * FROM weight_values', (err, result, fields) => {
         console.log(result);
         return result;
      });
   }

   public get_word_count(): number[] {
      console.log(this.connection);
      this.connection.query('SELECT * FROM word_count', (err, result, fields) => {
         console.log(result);
         return result;
      });
   }
}
