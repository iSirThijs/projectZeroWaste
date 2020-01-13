require('dotenv').config();
require('#utilities/database.js');


//controllers
const job = require('#controllers/job.js');
const company = require('#controllers/job.js');
const building = require('#controllers/building.js');
const contract = require('#controllers/contract.js');

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


// currentJob.on('done', () => {
// 	runQueue();
// })

logger.debug('Job queue started');

runQueue();


function runQueue() {
	busy = true;

	job.load()
		.then((loadedJob) => {
			logger.debug('%o', loadedJob);
			if (!loadedJob) { 
				busy = false;
				throw 'noJobs';
			} else {
				logger.debug('Found a job');
				return loadedJob;
			}
		})
		.catch((error) => {
			if(error === 'noJobs') logger.debug(error);
			else logger.error(error);
		});
}