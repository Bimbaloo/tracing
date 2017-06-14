// var express = require('express')
// var app = express()

// app.use(express.static('./dist'))

// app.get('/', function (req, res) {
//   res.send('Hello Vue')
// })

// app.listen(2333)



"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	}
});

server.listen(8080, "127.0.0.1", function() {
	console.log("Starting server on http://localhost:8080");
});