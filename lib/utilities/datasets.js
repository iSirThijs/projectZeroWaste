// dependencies
const mongoose = require('mongoose');

// models
const Dataset = require('../models/dataset.js');

/**
 * Checks if a user with the specified data already exists
 * @param {Object} newUser - The user to be checked
 * @param {string} newUser.username - username of new user
 * @param {string} newUser.email - username of new user
 * @param {array} [keys=[username]] - an array of keys to check for existence, defaults to check by username only
 * @returns {Promise.<Object>} - Rejects if the user already exists(throws a message) or resolves if not(returns the newUser)
 */

/** 
 * 
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