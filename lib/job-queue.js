require('dotenv').config();
// controllers
const dataset = require('#controllers/dataset.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('jobQueue');



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
	logger.debug(`Task added: ${msg.job}`);
	logger.silly('dataset: %o', dataset);

	if (status === 'idle') runQueue();
	else logger.debug('Tasklist already running');
}

// function deleteFromQueue(msg){
	



// }

// function holdTask(msg) {

// }

// Main function to run jobs
function runQueue() {
	status = 'working';
	logger.debug('Started running jobs in queue');
	
	// check to see if currentTask already loaded
	if (currentJob) {
		logger.debug('Job already loaded');
		logger.silly('job: %o', currentJob);
		return;
	}

	// check to see if tasklist is filled
	if (jobQueue.length === 0 ) {
		// check DB for unfinished jobs (status = queue)
		logger.debug('Job queue is empty, going in standby');
		status = 'idle'; 
		return;
	}

	// if not, get the first entry from tasklist
	currentJob = jobQueue.shift();
	logger.debug('Job loaded');
	logger.silly('job: %o', currentJob);

	// set status of the currentTask to running en upload status change to DB
	dataset.updateStatus(currentJob.dataset, 'running')
		.then(dataset => currentJob.dataset = dataset)
		.then(() => sendToWorker(currentJob))
		.catch(err => {
			status = 'error';
			error = err;
		});	
}

// sent the currentTask to the right worker
function sendToWorker(currentJob){
	logger.debug(`Sending job: ${currentJob.job} to right worker`);
	logger.silly('dataset: %o', currentJob.dataset);
	switch(currentJob.job){
	case 'addDataset': {
		logger.debug('Add datasetJob, sending to worker');
		// dataset.extractFileToDatabase(currentJob.dataset);
		break;
	}
	}
}

// function getJobsFromDatabase() {



// }

// function jobDone(currentJob){
// updates status of dataset as loaded
// moves to done array
// rerun queue 
//}

// function jobFailed(currentJob){}