const { fork } = require('child_process');

// utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Job');
const csv = require('#utilities/csv.js');
const validate = require('#utilities/data_validation.js');

// controllers
const company = require('#controllers/company.js');
const building = require('#controllers/building.js');
const contract = require('#controllers/contract.js');

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
		logger.debug('Checking if a job with %o', filter);
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
 * @param {String} status Status (running, queue, done, failed) to load a job for
 * @returns {Promise<Object>} A promise that resolves in either a mongoose document or null
 */
function load(status) {
	return new Promise((resolve, reject) => {
		
		logger.debug(`finding a job with status: ${status}`);
		Job.findOne({status: status})
			.then((job) => {
				if (job) {
					logger.debug(`found a ${status} Job`);
					resolve(job);
				} else {
					logger.debug(`No jobs with status: ${status}`);
					resolve(job);
				}
			})
			.catch(error => {
				logger.error(error);
				reject({type: 'error', error});
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


function extractDataset(job) {
	logger.debug('Extracting dataset');
	return new Promise((resolve, reject) => {
		

		csv.loadCSV(job.dataset.path)
			.then((data) => validate.checkRequiredColumns(data))
			.then((data) => validate.checkRequiredValues(data))
			.then((data) => extractEntries(job, data))
			.then((contracts) => resolve(contracts))
			.catch(error => reject(error));

	});
}

async function extractEntries(job, data){
	logger.debug('Data validated, extracting entries');
	let { _id: datasetID } = job;
	let contracts = [];

	for (let current = 0; current < data.length; current++) {
		let percentage = Math.round(current.length / data.length) * 100;
		let regex = new RegExp(/^\d(0|5)$/);
		if (regex.test(percentage)) logger.debug(`${percentage} - Current: ${current + 1} out of ${data.length}`);
		
		try {
			let companyID = await company.extract(data[current], datasetID);
			let buildingID = await building.extract(data[current], datasetID, companyID);
			let contractID = await contract.extract(data[current], datasetID, companyID, buildingID);
			contracts.push(contractID);

			if(data.length === contracts.length) return contracts;
		} catch(error) {
			logger.error(error);
			throw error;
		}
	}
}

module.exports = {
	save,
	exists,
	getAllJobs,
	load,
	updateStatus,
	extractDataset
};



