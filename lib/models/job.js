const { Schema, model } = require('mongoose');

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


	// run(){
	// 	logger.debug('running Job');
	// 	if(this.type === 'addDataset' ) return this.extractDataset();
	// }

	// extractDataset() {
	// 	logger.debug('Extracting dataset');
	// 	return new Promise((resolve, reject) => {
	// 		let loadedData;

	// 		csv.loadCSV(this.dataset.path)
	// 			.then((data) => validate.checkRequiredColumns(data))
	// 			.then((data) => validate.checkRequiredValues(data))
	// 			.then((data) => { 
	// 				loadedData = data;
	// 				logger.debug('Validation Okay');
	// 				logger.debug('Looping over data to save entries');
					
	// 				return data;
	// 			})
	// 			.then((data) => data.forEach(async datum => {
	// 				try {
	// 					let datasetID = this._id;
	// 					let companyID = await company.extractCompany(datum);
	// 					let buildingID = await building.extractBuilding(datum, companyID);

	// 				} catch (error) {
	// 					logger.error(error);
	// 				}

	// 			})
	// 			)
	// 			.catch(error => reject(error));
	// 	});
	// }
	
}


jobSchema.loadClass(JobClass);

const Job = model('Job', jobSchema);

module.exports = Job;
