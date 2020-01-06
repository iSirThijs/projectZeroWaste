// dependencies
const mongoose = require('mongoose');

// models
const User = require('@models/account/user.js');

/**
 * Checks if a user with the specified data already exists
 * @param {Object} newUser - The user to be checked
 * @param {string} newUser.username - username of new user
 * @param {string} newUser.email - username of new user
 * @param {array} [keys=[username]] - an array of keys to check for existence, defaults to check by username only
 * @returns {Promise.<Object>} - Rejects if the user already exists(throws a message) or resolves if not(returns the newUser)
 */
exports.checkExistence = function(newUser, keys = ['username']) {
	return new Promise((resolve, reject) => {

		mongoose.connect(process.env.MONGODB,
			{
				dbName: process.env.DB_NAME,
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
		const db = mongoose.connection;

		db.on('error', (error) => reject({type: 'error', data: error}));
		db.once('open', async function () {
			let checks = keys.map(async key => {
				try { 
					let check = {[key]: newUser.get(key)};
					let data = await User.find(check);
					let user = data && data[0];

					if (user) return {type: 'silly', data: `A user with ${key} ${newUser.get(key)} already exists`};
					else return false;
				} catch(error) {
					throw {type: 'error', data: error};
				}
			});

			checks = await Promise.all(checks);

			let uniqueUser = checks.every(check => !check);

			if (uniqueUser) resolve(newUser);
			else {
				let filtered = checks.filter((check) => !check[0]);
				reject(filtered[0]);
			}
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
				useNewUrlParser: true,
				useUnifiedTopology: true
			});

		const db = mongoose.connection;

		db.on('error', (error) => reject({type: 'error', data: error}));
		db.once('open', async () => {
			let modeledUser = new User(Object.fromEntries(newUser));

			modeledUser.save((error, user) => {
				if (error) reject({type: 'error', data: error});
				else resolve({type: 'silly', data: user});
			});
		});
	});
};