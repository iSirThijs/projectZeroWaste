const log = require('../logger').getLogger('data-processing');
const dataset = require('../datasets.js');
// const mongoose = require('mongoose');

// models
// const Company = require('../../models/company.js');

let busy = false;
let task = undefined;
let tasklist = [];
let done = [];

process.on('message', (msg) => {
	switch(msg.type) {
	case 'tasklist': {
		process.send({type: 'tasklist', content: tasklist});
		break;
	}
	case 'task': addToTasklist(msg);
	}
});

function addToTasklist(msg) {
	let task = { type: msg.task, dataset: msg.content };
	log.debug('Task added: %o', task);
	tasklist.push(task);
	if (!busy) runTasklist();
	else log.debug('tasklist already running');
}

function runTasklist() {
	busy = true;
	// check to see if task already loaded
	if (task) {
		log.debug('task already loaded: %o', task);
		return;
	}

	// check to see if tasklist is filled
	if (tasklist.length === 0 ) {
		log.debug('tasklist is empty, going in standby');
		busy = false; 
		return;
	}

	// if not, get the first index from tasklist
	task = tasklist.shift();
	log.silly('loaded a task: %o', task);

	// set status of the task to running
	task.dataset.status = 'running';
	log.silly('changed task status to running');
	
	// sent the task to the right worker
	switch(task.type){
	case 'addData': {
		log.debug('Add Data Task, sending to worker');
		
		dataset.processNewData(task.dataset)
			.then(() => {
				task.dataset.status = 'done';
				// upload dataset metadata to DB with done;
				done.push(task);
				task = undefined;
				return runTasklist();
			})
			.catch(error => {
				log.error(error);
				// go to failed queue with error
			});
		break;
	}
	}

	// 

	// wait for the task to complete and set status done
	
	// run itself again

}