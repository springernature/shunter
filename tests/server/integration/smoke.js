var request = require('supertest');
var processManager = require('./processManager');

var startServersPromise = processManager.startServers();


startServersPromise.then( success => {
	request = request('http://localhost:5400');
	var waitTill = new Date(new Date().getTime() + 1000);while(waitTill > new Date()){}
	request
		.get('/home')
		.then(res => {
			console.log(res.text)
		});
});
