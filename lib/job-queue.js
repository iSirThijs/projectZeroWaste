require('dotenv').config();
require('#utilities/database.js').loggerName('Job Queue');

//controllers
const job = require('#controllers/job.js');
const area = require('#controllers/area.js');

//utilities
const logger = require('#utilities/logger.js').getLogger('Job Queue');
const amsAPI = require('#utilities/amsterdam_api.js');


//states
let busy = false;

// listeners
process.on('message', (msg) => {
	if(msg ==='SavedJob' && !busy) setImmediate(loadJob) ;
	else if(msg === 'SavedJob') logger.debug('Job queue already running');
});

logger.debug('Job queue started');
logger.debug(process.env.LOAD_AMS)

if(process.env.LOAD_AMS === 'true') {
	busy = true;
	logger.debug('Filling database with Amsterdam Areas');
	getAMSareas('stadsdelen')
		.then(() => getAMSareas('wijken'))
		.then(() => getAMSareas('buurten'))
		.finally(() => {
			busy = false;
			setImmediate(loadJob);
		});
} else setImmediate(loadJob);


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
	// .then((contracts) => computeAreas(loadedJob))
	// .then((contracts) => computeSBI(loadedJob))
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
	// rollback -> 
	let failReason = error.type == 'warning' ? error.message : 'There was an unknown error';

	job.updateStatus(loadedJob, 'failed', failReason)
		.then(() => setImmediate(loadJob));

}

function getAMSareas(mapping) {
	return new Promise((resolve, reject) => {
		amsAPI.getMapping(mapping)
			.then((amsAreas) => {
				let savedAreas = amsAreas.map((amsArea) => area.save(amsArea));
				return Promise.all(savedAreas);
			})
			.then(() => resolve())
			.catch(error => reject(error));
	});
}