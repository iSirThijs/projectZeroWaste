require('dotenv').config();
require('#utilities/database.js').loggerName('Job Queue');

//controllers
const job = require('#controllers/job.js');

//utilities
const logger = require('#utilities/logger.js').getLogger('Job Queue');

//states
let busy = false;


// listeners
process.on('message', (msg) => {
	if(msg ==='SavedJob' && !busy) setImmediate(loadJob) ;
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

	logger.debug('Starting job, finding right worker');

	job.updateStatus(loadedJob, 'running')
		.then((loadedJob) => {
			if(loadedJob.type === 'addDataset') {
				setImmediate(() => addDataset(loadedJob));
			} else {
				job.updateStatus(loadedJob, 'done');
				logger.debug('Nothing to do, back to idle');
				busy = false;
				setImmediate(loadJob);
			}	
		})
		.catch(error => logger.error(error));
	

}


function addDataset(loadedJob) {

	logger.debug('Job to add dataset');

	job.extractDataset(loadedJob)
		.then((contracts) => done(loadedJob, contracts))
		.catch((error) => failed(loadedJob, error)); // rollback of already loaded data?

}

function done(loadedJob, contracts){
	logger.debug('Dataset added');
	logger.debug(`Added ${contracts.length} entries`);

	job.updateStatus(loadedJob, 'done')
		.then(() => setImmediate(loadJob));

}

function failed(loadedJob, error){
	logger.debug('Dataset not added added');

	let failReason = error.type == 'warning' ? error.message : 'There was an unknown error';

	job.updateStatus(loadedJob, 'failed', failReason)
		.then(() => setImmediate(loadJob));

}