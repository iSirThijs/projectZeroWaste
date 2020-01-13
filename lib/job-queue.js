require('dotenv').config();
require('#utilities/database.js');

//models

//controllers
const job = require('#controllers/job.js');

//utilities
const logger = require('#utilities/logger.js').getLogger('Job Queue');

//states
let busy = false;
let currentJob;


// listeners
process.on('message', (msg) => {
	if(!busy) runQueue();
	else logger.debug('Job queue already running');
});

logger.debug('Job queue started');

runQueue();


function runQueue() {
	busy = true;

	job.loadJob()
		.then((loadedJob) => {
			logger.debug('%o', loadedJob);
			if (!loadedJob) throw new Error('noJobs');
			currentJob = loadedJob;
			logger.debug('Found a job');
			
		})
		.then(() => currentJob.updateStatus('running'))
		.then(() => currentJob.run())
		.catch((error) => {
			if(error.message === 'noJobs') busy = false;
			if(error.type === 'warning') {
				currentJob.updateStatus('failed', error.message);	
				logger.debug('%o', currentJob);
				currentJob.emit('done');
				currentJob = undefined;		
			} else if (error.type === 'error') {
				currentJob.updateStatus('failed', 'Er was een onbekende fout');
				logger.debug('%o', currentJob);
				currentJob.emit('done');
				currentJob = undefined;		
			} else {
				logger.error(error);	
			}
		});
}