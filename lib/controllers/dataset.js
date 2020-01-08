// dependencies
const mongoose = require('mongoose');
const logger = require('@utilities/logger.js').getLogger('dataset');

// models
const Dataset = require('@models/dataset.js');

exports.exists = function(dataset){
	return new Promise((resolve, reject) => {
		logger.silly('Checking dataset for existence: %o', dataset);

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
			logger.silly('db connection is open');
			try {
				let data = Dataset.exists({company: dataset.company});

				if (await data) {
					logger.silly('DatasetExists');
					reject(new Error('DatasetExists'));
				}
				else {
					logger.silly('Dataset doesn\'t exists');
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
		logger.silly('Saving metadata for dataset: %o', dataset);

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
			logger.silly('db connection is open');
			let modeledDataset = new Dataset(dataset);

			modeledDataset.save((error, savedDataset) => {
				if (error) {
					logger.error(error);
					reject({type: 'error', data: error});
				}
				else {
					logger.silly('dataset metadata saved in database');
					resolve(savedDataset);}
			});
		});
	});
};


// update status of task
exports.updateStatus = function(dataset, status) {
	return new Promise(function(resolve, reject) {
		logger.silly('Updating status for: %o', dataset);

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
			logger.silly('db connection is open');

			Dataset.findByIdAndUpdate(dataset._id, {status: status}, {new: true, }, (error, updatedDataset) => {
				if(error) {
					logger.error(error);
					reject({type: 'error', data: error});
				} else {
					logger.silly('updated dataset with new status: %o', updatedDataset);
					resolve(updatedDataset);
				}
			});
		});
	});
};

// Get jobs from database
// exports.updateStatus = function(status) {
// 	return new Promise(function(resolve, reject) {
// 		logger.silly('Saving metadata for dataset: %o', dataset);

// 		mongoose.connect(process.env.MONGODB,
// 			{
// 				dbName: process.env.DB_NAME,
// 				useNewUrlParser: true,
// 				useUnifiedTopology: true
// 			});

// 		const db = mongoose.connection;

// 		db.on('error', (error) => {
// 			logger.error(error);
// 			reject({type: 'error', data: error});
// 		});
// 		db.once('open', async () => {
// 			logger.silly('db connection is open');

// 			Dataset.findByIdAndUpdate(dataset._id, {status: status}, {new: true}, (error, updatedDataset) => {
// 				if(error) {
// 					logger.error(error);
// 					reject({type: 'error', data: error});
// 				} else {
// 					logger.debug('updated dataset with new status: %o', updatedDataset);
// 					resolve(updatedDataset);
// 				}
// 			});
// 		});
// 	});
// };




// module.exports.extractFileToDatabase = function(dataset) {

// }


// module.exports.deleteDataset = function(dataset) {

// }