/// <reference path="../ts/definitely/node.d.ts" />
/// <reference path="../ts/definitely/ejs.d.ts" />
"use strict";
var http = require('http');
var fs = require('fs');
var ejs = require('ejs');
var qs = require('querystring');
var config = require('./config');
var server = http.createServer();
var template = fs.readFileSync(__dirname + '/../views/app.ejs', 'utf-8');
function renderForm(post, res) {
    var data = ejs.render(template, {
        result: post
    });
    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(data);
}
server.on('request', get_contents);
server.listen(config.port, config.host);
console.log('server listening ... ');
function get_contents(req, res) {
    var file_path = __dirname + '/../views' + req.url;
    switch (req.url) {
        case '/':
            fs.readFile(__dirname + '/../views/app.ejs', 'utf-8', function (err, data) {
                if (err) {
                    res.writeHead(404, { 'Content-type': 'text/plain' });
                    res.write('not found!');
                    return res.end();
                }
                renderForm('', res);
            });
            break;
        case '/css/bootstrap.min.css':
            fs.readFile(file_path, 'utf-8', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data, 'utf-8');
            });
            break;
        case '/js/jquery.js':
            fs.readFile(file_path, 'utf-8', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(data, 'utf-8');
            });
            break;
        case '/js/bootstrap.min.js':
            fs.readFile(file_path, 'utf-8', function (err, data) {
                res.writeHead(200, { 'Content-Type': 'text/javascript' });
                res.end(data, 'utf-8');
            });
            break;
    }
    if (req.method === 'POST') {
        req.data = '';
        req.on('readable', function () {
            req.data += req.read();
        });
        req.on('end', function () {
            var query = qs.parse(req.data);
            renderForm(query.name, res);
        });
    }
}
