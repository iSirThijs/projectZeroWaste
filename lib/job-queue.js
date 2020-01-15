require('dotenv').config();
require('#utilities/database.js').loggerName('Job Queue');

//controllers
const job = require('#controllers/job.js');
const company = require('#controllers/job.js');
const building = require('#controllers/building.js');
const contract = require('#controllers/contract.js');

//utilities
const logger = require('#utilities/logger.js').getLogger('Job Queue');

//states
let busy = false;


// listeners
process.on('message', (msg) => {
	if(msg ==='SavedJob' && !busy) loadJob();
	else if(msg === 'SavedJob') logger.debug('Job queue already running');
});

logger.debug('Job queue started');

loadJob();


// Initial function to load the job passes it into startJob to execute the job
function loadJob() {
	busy = true;

	logger.debug('Loading new job');

	job.load('running')
		.then((loadedJob) => {
			if(!loadedJob) return job.load('queue');
			else return loadedJob;
		})
		.then((loadedJob) => {
			if(!loadedJob) { 
				logger.debug('No jobs to do, going back to idle mode');
				busy = false;
			}
			else setImmediate(() => startJob(loadedJob));
		})
		.catch(error => logger.error(error));
}

// starts the job and delegates it to the right worker
function startJob(loadedJob) {
	

	job.updateStatus(loadedJob, 'done')
		.then(() => loadedJob = undefined)
		.catch(error => logger.error(error));

	setImmediate(loadJob);
	
}


