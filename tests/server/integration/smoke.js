var request = require('supertest');
var processManager = require('./processManager');

var startServersPromise = processManager.startServers();

startServersPromise.then( success => {
	request = request('http://localhost:5401');
	request
		.get('/')
		.then(res => {
			console.log(res.text)
		});
});
