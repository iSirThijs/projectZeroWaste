/**
 * Utility functions to help with registering a user to the site
 * @module 
 */

// dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// models
const User = require('../models/user.js');

/**
 * Checks if a user with the specified data already exists
 * @param {string} check - the key to check for existence
 * @param {string} info - the data from the user to check for existence 
 * @returns {Promise.<boolean>} - A boolean indicating if a user exist(reject/true) or not (resolve/false)
 */
exports.checkExistence = function(check, info) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true
			});
		const db = mongoose.connection;

		db.on('error', () => reject({type: 'error'}));
		db.once('open', async function () {
			let data = await User.find({ [check]: info });
			let user = data && data[0];

			if (!user) resolve(false);
			else resolve(true);
		});
	});
};

/** 
 * Saves a new user to the database
 * @param {Object} newUser - The user to be saved
 * @param {string} newUser.username - the username for the 
 * @param {string} newUser.email - the new users email
 * @param {string} newUser.password - the password to be hashed
 * @returns {Promise} Promise object that saves the user. Returns the user or an error
 */
exports.register = function(newUser) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true
			});

		const db = mongoose.connection;

		db.on('error', (err) => reject(err));
		db.once('open', async () => {
			let modeledUser = new User({
				username: newUser.username,
				email: newUser.email,
				hash: await bcrypt.hash(newUser.password, 10)
			});

			modeledUser.save((err, user) => {
				if (err) reject(err);
				else resolve(user);
			});
		});
	});
};