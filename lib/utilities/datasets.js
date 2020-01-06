// dependencies
const mongoose = require('mongoose');
const fs = require('fs').promises;
const d3 = require('d3');

const log = require('./logger.js').getLogger('dataset');

// models
const Dataset = require('../models/dataset.js');

/**
 *
 *
 * @param {Object} dataset
 * @returns
 */
exports.register = function(dataset) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});

		const db = mongoose.connection;

		db.on('error', (error) => reject({type: 'error', data: error}));
		db.once('open', async () => {
			let modeledDataset = new Dataset(dataset);

			modeledDataset.save((error, savedDataset) => {
				if (error) reject(error);
				else resolve(savedDataset);
			});
		});
	});
};

// process new data
exports.processNewData = function(dataset) {
	return new Promise(function(resolve, reject) {
		let { originalname, company, filename, path, status } = dataset;
		
		fs.readFile(path)
			.then(dataBuffer => dataBuffer.toString())
			.then(dataString => {
				const ssv = d3.dsvFormat(';');
				log.debug(dataString);
				return ssv.parse(dataString);
			})
			.then((data) => {
				log.debug('%o', data); 
				resolve(data);
			}) 
			// .then((data) => )// ---> save / update the data to mongoDB
			.catch((error) => {
				reject(error);
			});


	});
};