// utilities
const logger = require('#utilities/logger.js').getLogger('Job');

// models 
const Job = require('#models/job.js');

// save a new job
function save(collectionCompany, originalname, path) {
	return new Promise((resolve, reject) => {

		let modeledJob = new Job({
			type: 'addDataset',
			dataset: {
				collectionCompany,
				path,
				originalname,
			}
		});

		modeledJob.save()
			.then((savedJob) => resolve(savedJob._id))
			.catch((error) => {
				logger.error(error);
				reject({type: 'error', error});
			});

	});
}


function exists(filter){
	return new Promise((resolve, reject) => {
		logger.debug('Checking if a job with %0', filter);
		Job.exists(filter)
			.then((exists)=> resolve(exists))
			.catch((error) => reject(error));
	});
}

function loadJob() {
	return new Promise((resolve, reject) => {
		
		logger.debug('finding a job with status: running');
		Job.findOne({status: 'running'})
			.then((job) => {
				if (job) {
					logger.debug('found a running Job');
					resolve(job);
				} else {
					logger.debug('finding a job with status: queue');
					Job
						.findOne({status: 'queue'})
						.then((job) => {
							resolve(job);
						})
						.catch(error => {
							logger.error(error);
							reject({type: 'error', error});
						});
				}
			});
	});
}


async function getJobs() {
	let inQueue = await Job.findByStatus('queue');
	let running = await Job.findByStatus('running');
	let failed = await Job.findByStatus('failed');
	let done = await Job.findByStatus('done');

	return {
		inQueue, 
		running,
		failed,
		done
	};
}




module.exports = {
	save,
	exists,
	getJobs,
	loadJob
};



