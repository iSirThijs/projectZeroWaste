const log = require('../logger').getLogger('data-processing');
// const mongoose = require('mongoose');

// models
// const Company = require('../../models/company.js');

let tasklist = [];

process.on('message', (msg) => {
	switch(msg.type) {
	case 'tasklist': {
		process.send({type: 'tasklist', content: tasklist});
		break;
	}
	case 'task': addToTasklist(msg);
	}
});


function addToTasklist(msg){
	let task = { task: msg.task, dataset: msg.content };
	tasklist.push(task);
}