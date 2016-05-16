/// <reference path="../ts/definitely/node.d.ts" />
/// <reference path="../ts/definitely/ejs.d.ts" />

import http   = require('http');
import fs     = require('fs');
import ejs    = require('ejs');
import qs     = require('querystring');
import config = require('./config');

var server: http.Server = http.createServer();
var template: any       = fs.readFileSync(__dirname + '/../views/app.ejs', 'utf-8');

function renderForm(post: string, result: string, method: string, res: any) {
   var data: any = ejs.render(template, {
      method: method,
      post  : post,
      result: '',
   });

   res.writeHead(200, {'Content-type': 'text/html'});
   res.end(data);
}

server.on('request', get_contents);
server.listen(config.port, config.server);
console.log('server listening ... ');

function get_contents(req, res)
{
   var file_path: string = __dirname + '/../views' + req.url;
   switch(req.url) {
      case '/':
         fs.readFile(__dirname + '/../views/app.ejs', 'utf-8', (err, data) =>
         {
            if (err) {
               res.writeHead(404, {'Content-type': 'text/plain'});
               res.write('not found!');
               return res.end();
            }

            if (req.method === 'POST') {
               req.data = '';
               req.on('readable', () =>
               {
                  req.data += req.read();
               });
               req.on('end', () =>
               {
                  var query = qs.parse(req.data);
                  renderForm(query.document, '', 'POST', res);
               });
            } else {
               renderForm('', '', 'GET', res);
            }

         });
         break;

      case '/css/bootstrap.min.css':
         fs.readFile(file_path, 'utf-8', (err, data) =>
         {
            res.writeHead(200, {'Content-Type': 'text/css'});
            res.end(data, 'utf-8');
         });
         break;

      case '/js/jquery.js':
         fs.readFile(file_path, 'utf-8', (err, data) =>
         {
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(data, 'utf-8');
         });
         break;

      case '/js/bootstrap.min.js':
         fs.readFile(file_path, 'utf-8', (err, data) =>
         {
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(data, 'utf-8');
         });
         break;
    }
}
