require('dotenv').config();
require('module-alias/register');

const log = require('@utilities/other/logger.js').getLogger('queue');
const data = require('@utilities/data/data.js');

let busy = false;  // Status of the queue
let job = undefined; // Current job
let queue = []; // Queued jobs
let done = []; // finished jobs
let failed = []; // failed jobs
let onHold = []; // paused jobs

// Listener for instructions
process.on('message', (msg) => {
	switch(msg.type) {
	case 'status': {
		process.send({
			type: 'status', 
			busy,
			job,
			queue,
			done,
			failed,
			onHold
		});
		break;
	}
	case 'addTask': {
		addToQueue(msg);
		break;
	}
	// case 'deleteTask': {
	// 	deleteFromQueue(msg);
	// 	break;
	// }
	// case 'holdTask': {
	// 	holdTask(msg);
	// 	break;
	// }
	}
});

runQueue();

// Job management
function addToQueue(msg) {
	let newJob = { task: msg.task, dataset: msg.dataset };
	queue.push(newJob);
	log.debug('Task added: %o', newJob);

	if (!busy) runQueue();
	else log.debug('Tasklist already running');
}

// function deleteFromQueue(msg){

// }

// function holdTask(msg) {

// }

// Main function to run jobs
function runQueue() {
	busy = true;
	log.debug('Started running jobs in queue');
	
	// check to see if currentTask already loaded
	if (job) {
		log.debug('task already loaded: %o', job);
		return;
	}

	// check to see if tasklist is filled
	if (queue.length === 0 ) {
		// check DB for unfinished jobs (status = queue)
		log.debug('Queue is empty, going in standby');
		busy = false; 
		return;
	}

	// if not, get the first entry from tasklist
	job = queue.shift();
	log.silly('loaded a job: %o', job);

	// set status of the currentTask to running
	job.dataset.status = 'running';
	// upload status change to DB
	log.silly('changed job status to running');
	
	// sent the currentTask to the right worker
	switch(job.task){
	case 'add': {
		log.debug('Add Data job, sending to worker');
		
		// data.add(job.dataset)
		// 	.then(() => {
		// 		job.dataset.status = 'done';
		// 		// upload dataset metadata to DB when done;
		// 		done.push(job);
		// 		job = undefined;
		// 		return runQueue();
		// 	})
		// 	.catch(error => {
		// 		log.error(error);
		// 		// go to failed queue with error
		// 	});
		break;
	}
	}
}