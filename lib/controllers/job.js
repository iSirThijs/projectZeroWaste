
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
		Job.exists(filter)
			.then((exists)=> resolve(exists));
	});
}


module.exports = {
	save,
	exists
};



