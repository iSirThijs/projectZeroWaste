// utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Job');

// models 
const Job = require('#models/job.js');

/**
 * Saves a uploaded dataset into a job
 *
 * @param {String} collectionCompany - The name of the collection company (owner of the data)
 * @param {String} originalname - The original file name from the computer of the uploader
 * @param {String} path - the path were the uploaded file is located
 * @returns {String} - Promise object resolving in the ID of the saved job
 */
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

		logger.debug('Saving a new job: %o', modeledJob);

		modeledJob.save()
			.then((savedJob) => resolve(savedJob._id))
			.catch((error) => {
				logger.error(error);
				reject({type: 'error', error});
			});

	});
}

/**
 * Checks if a job with the supplied conditions exists
 *
 * @param {Object} filter - an object with conditions
 * @returns {Promise<boolean>} A promise that resolves in a boolean if it exists
 */
function exists(filter){
	return new Promise((resolve, reject) => {
		logger.debug('Checking if a job with %0', filter);
		Job.exists(filter)
			.then((exists)=> resolve(exists))
			.catch((error) => {
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}

/**
 * finds a job that has to be done
 *
 * @returns {Promise<Object>} A promise that resolves in either a mongoose document or null
 */
function load() {
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

/**
 * Gets all the jobs sorted with their status
 *
 * @returns {Object<Array>} an object with status keys and job arrays as values
 */
async function getAllJobs() { 
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

/**
 * updates the status of the provided job in the database and returns the updated job
 *
 * @param {Object} job - A mongoose instance of a Job model
 * @param {String} status - A string representing status: running, queue, done, failed 
 * @param {String} failReason - A string stating the failreason. Required if status is failed
 * @returns {Promise} A promise that resolves to the updated doc
 */
function updateStatus(job, status, failReason) {
	return new Promise((resolve, reject) => {
		if (status === 'failed' && !failReason) reject(new Error('A fail reason must be given when status is failed'));

		job.status = status;
		if(failReason) job.failReason = failReason;

		job.save()
			.then((updatedJob) => resolve(updatedJob))
			.catch((error) => reject(error));
	});
}


module.exports = {
	save,
	exists,
	getAllJobs,
	load,
	updateStatus
};



