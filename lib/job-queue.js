require('dotenv').config();
require('module-alias/register');

// controllers
const dataset = require('@controllers/dataset.js');

// utilities
const log = require('@utilities/logger.js').getLogger('jobQueue');



let status = 'idle';  // Status of the queue
let error = null;
let currentJob = undefined; // Current job
let jobQueue = []; // Queued jobs
let done = []; // finished jobs
let failed = []; // failed jobs


// Listener for instructions
process.on('message', (msg) => {
	switch(msg.instruction) {
	case 'status': {
		process.send({
			type: 'status', 
			status,
			error,
			currentJob,
			jobQueue,
			done,
			failed
		});
		break;
	}
	case 'addJob': {
		addToJobQueue(msg);
		break;
	}
	// case 'removeJob': {
	// 	deleteFromQueue(msg);
	// 	break;
	// }
	}
});

runQueue();

// Job management
function addToJobQueue(msg) {
	let newJob = { job: msg.job, dataset: msg.dataset };
	jobQueue.push(newJob);
	log.debug('Task added: %o', newJob);

	if (status === 'idle') runQueue();
	else log.debug('Tasklist already running');
}

// function deleteFromQueue(msg){
	



// }

// function holdTask(msg) {

// }

// Main function to run jobs
function runQueue() {
	status = 'working';
	log.debug('Started running jobs in queue');
	
	// check to see if currentTask already loaded
	if (currentJob) {
		log.debug('task already loaded: %o', currentJob);
		return;
	}

	// check to see if tasklist is filled
	if (jobQueue.length === 0 ) {
		// check DB for unfinished jobs (status = queue)
		log.debug('Job queue is empty, going in standby');
		status = 'idle'; 
		return;
	}

	// if not, get the first entry from tasklist
	currentJob = jobQueue.shift();
	log.silly('loaded a job: %o', currentJob);

	// set status of the currentTask to running en upload status change to DB
	dataset.updateStatus(currentJob, 'running')
		.then(dataset => currentJob = dataset)
		.then(() => sendToWorker(currentJob))
		.catch(err => {
			status = 'error';
			error = err;
		});	
}

// sent the currentTask to the right worker
function sendToWorker(dataset){

	log.silly('Sending dataset to right worker: %o', dataset);

	done.push(currentJob);
	status = 'idle';
	// 	// 		job = undefined;
	// 	// 		return runQueue();
	
	// switch(currentJob.task){
	// case 'add': {
	// 	log.debug('Add Data job, sending to worker');
		
	// 	// data.add(job.dataset)
	// 	// 	.then(() => {
	// 	// 		job.dataset.status = 'done';
	// 	// 		// upload dataset metadata to DB when done;
	// 	// 		done.push(job);
	// 	// 		job = undefined;
	// 	// 		return runQueue();
	// 	// 	})
	// 	// 	.catch(error => {
	// 	// 		log.error(error);
	// 	// 		// go to failed queue with error
	// 	// 	});
	// 	break;
	// }
	// }
}

// function getJobsFromDatabase() {



// }

// function jobDone(currentJob){}

// function jobFailed(currentJob){}