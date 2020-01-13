const { Schema, model } = require('mongoose');

const csv = require('#utilities/csv.js');
const validate = require('#utilities/data_validation.js');
const logger = require('#utilities/logger.js').getLogger('Current Job');

const company = require('#controllers/company.js');

const datasetSchema = new Schema({
	collectionCompany: {
		type: String,
		select: true,
		required: [true, 'CollectionCompany is required']
	},
	originalname: String,
	path: {
		type: String,
		select: true,
	},
	// uploadedBy: {type: Schema.Types.ObjectId, ref: 'User'},
}, {_id: false});



const jobSchema = new Schema({
	type: {
		type: String,
		select: true,
		enum: ['addDataset', 'removeDataset'],
		required: [true, 'I need to know what to do']},
	status: {
		type: String,
		select: true,
		default: 'queue',
		enum: ['queue', 'running', 'failed', 'done'],
		required: [true, 'Need a status']
	},
	failReason: {
		type: String,
		select: true,
		required: [function(){
			return this.status === 'failed';
		}, 'Need a fail reason if status is failed']
	},
	dataset: datasetSchema,
});


class JobClass {
	static findByStatus(status) {
		return this.find({ 'status': status});
	}

	updateStatus(status, failReason) {
		return new Promise((resolve, reject) => {
			if (status === 'failed' && !failReason) reject(new Error('A fail reason must be given when status is failed'));

			this.status = status;
			if(failReason) this.failReason = failReason;

			this.save()
				.then(() => resolve(null))
				.catch((error) => reject(error));
		});
	}

	run(){
		logger.debug('running Job');
		if(this.type === 'addDataset' ) return this.extractDataset();
	}

	extractDataset() {
		logger.debug('Extracting dataset');
		return new Promise((resolve, reject) => {
			let loadedData;

			csv.loadCSV(this.dataset.path)
				.then((data) => validate.checkRequiredColumns(data))
				.then((data) => validate.checkRequiredValues(data))
				.then((data) => { 
					loadedData = data;
					logger.debug('Validation Okay');
					logger.debug('Looping over data to save entries');
					console.log(this);
					
					return data;
				})
				.then((data) => data.forEach(async datum => {
					try {
						let datasetID = this._id;
						let companyID = await company.extractCompany(datum);
					} catch
					

					// let buildingID = await 

				
					

					// extract company 
					// extract building
					// extract contract
				})
				)
				.catch(error => reject(error));
		});
	}
	
}


jobSchema.loadClass(JobClass);

const Job = model('Job', jobSchema);

module.exports = Job;
