
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
	return new Promise((resolve) => {
		Job.exists(filter)
			.then((exists)=> resolve(exists));
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
	getJobs
};



