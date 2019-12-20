const log = require('../logger').getLogger('data-processing');
// const mongoose = require('mongoose');

// models
// const Company = require('../../models/company.js');

let tasks = [];

process.on('message', (msg) => {
	if(msg.type === 'task') {
		log.debug(`new task: ${msg.task}: %o`, msg.content);
		tasks.push(msg.content);
		log.debug(`I now have ${tasks.length} tasks`);
	}
});