// dependencies
const mongoose = require('mongoose');
const logger = require('#utilities/logger.js').getLogger('dataset');


// controllers
const company = require('#controllers/company.js');

// models
const Dataset = require('#models/dataset.js');

// Utilities
const validate = require('#utilities/data_validation.js');
const csv = require('#utilities/csv.js');

exports.exists = function(dataset){
	return new Promise((resolve, reject) => {
		logger.debug(`Checking dataset for existence: ${dataset.company}`,);
		logger.silly('dataset: %o', dataset);

		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
		const db = mongoose.connection;

		db.on('error', (error) => {
			logger.error(error);
			reject({type: 'error', data: error});
		});
		db.once('open', async function () {
			logger.debug('db connection is open');
			try {
				let data = Dataset.exists({company: dataset.company});

				if (await data) {
					logger.debug('DatasetExists');
					logger.silly(data);
					reject(new Error('DatasetExists'));
				}
				else {
					logger.debug('Dataset doesn\'t exists');
					logger.silly(data);
					resolve(dataset);
				}

			} catch(error) {
				logger.error(error);
				reject(error);
			}
		});
	});
};

exports.saveMetadata = function(dataset) {
	return new Promise(function(resolve, reject) {
		logger.debug('Saving metadata for dataset: %o', dataset);
		logger.silly('dataset: %o', dataset);

		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});

		const db = mongoose.connection;

		db.on('error', (error) => {
			logger.error(error);
			reject({type: 'error', data: error});
		});
		db.once('open', async () => {
			logger.debug('db connection is open');
			let modeledDataset = new Dataset(dataset);

			modeledDataset.save((error, savedDataset) => {
				if (error) {
					logger.error(error);
					reject({type: 'error', data: error});
				}
				else {
					logger.debug('dataset metadata saved in database');
					logger.silly('dataset: %o', savedDataset);
					resolve(savedDataset);}
			});
		});
	});
};


// update status of task
exports.updateStatus = function(dataset, status) {
	return new Promise(function(resolve, reject) {
		logger.debug(`Updating status to ${status} for dataset: ${dataset._id}`);
		logger.silly('dataset: %o', dataset);

		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false
			});

		const db = mongoose.connection;

		db.on('error', (error) => {
			logger.error(error);
			reject({type: 'error', data: error});
		});
		db.once('open', async () => {
			logger.debug('db connection is open');

			Dataset.findByIdAndUpdate(dataset._id, {status: status}, {new: true }, (error, updatedDataset) => {
				if(error) {
					logger.error(error);
					reject({type: 'error', data: error});
				} else {
					logger.debug(`Updated status to ${status} for dataset: ${updatedDataset._id}`);
					logger.silly('dataset: %o', updatedDataset);
					resolve(updatedDataset);
				}
			});
		});
	});
};


// exports.extractFileToDatabase = function(dataset) {
// 	return new Promise(function(resolve, reject) {
// 		logger.debug('received addDataset job');
// 		logger.silly('dataset: %o', dataset);

// 		let { _id: datasetID, path } = dataset;

// 		csv.loadCSV(path)
// 			.then((data) => validate.checkRequiredColumns(data))
// 			.then((data) => validate.checkRequiredValues(data))
// 			.then((data) => {
// 				data.forEach(datum => {
// 					company.extractCompany(datum)
// 					.then((companyID) => resolve());
// 				});
// 			})
// 			.catch(error => reject(error));
// 	});
// };


// function dataTransformClean(data) {
// 	return 
// }