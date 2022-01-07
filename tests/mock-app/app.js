'use strict';

var shunter = require('../../');

var app = shunter({
	path: {
		themes: __dirname
	},
	routes: {
		localhost: {
			default: {
				host: '127.0.0.1',
				port: 5401
			}
		}
	}

});

app.start();
console.log('mock-app started');
