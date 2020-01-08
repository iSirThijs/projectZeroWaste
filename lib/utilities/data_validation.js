const logger = require('#utilities/logger.js').getLogger('Data Validation');
const mongoose = require('mongoose');


// Models
const Company = require('#models/company.js');
const Building = require('#models/building.js');
const Contract = require('#models/contract.js');
const User = require('#models/user.js');
const Dataset = require('#models/dataset.js');

module.exports.checkRequiredColumns = function(data) {
	logger.debug('Checking required columns');

	let requiredColumns = [
		'bedrijfsnaam',
		'straat',
		'huisnummer',
		'postcode',
		'sbi_hoofdcode',
		'sbi_code',
		'ma',
		'di',				
		'woe',
		'do',		   
		'vr', 
		'zat',			   
		'zo',
	];

	let missing = [];
	let required = requiredColumns.every((column) => {
		if (data.columns.indexOf(column) >= 0) return true;
		else {
			missing.push(column);
			return false;
		}
	});

	logger.debug(`Required: ${requiredColumns.join(', ')}`);

	if (required) {
		logger.debug('All required columns are present');
		return data;
	}
	else {
		logger.debug(`Missing columns: ${missing.join(', ')}`);
		throw {type: 'warning', message: `Missing columns: ${missing.join(', ')}`};
	}
};


module.exports.checkRequiredValues = function(data) {
	logger.debug('Checking required values');
	logger.debug('Required values: bedrijfsnaam, straat, huisnummer, postcode');
	

	let missing = new Set();

	data.forEach((datum) => {
		let {bedrijfsnaam, straat, huisnummer, postcode } = datum;
		
		if(!bedrijfsnaam || bedrijfsnaam.length == 0 || bedrijfsnaam == '') missing.add('bedrijfsnaam');
		if(!straat || straat.length <= 3 || straat == '') missing.add('straat');
		if(!postcode || postcode.length <= 3 || postcode == '') missing.add('postcode'); // also regex test here
	
		if(!huisnummer || huisnummer == '') missing.add('huisnummer');
		huisnummer = Number.parseInt(huisnummer);
		if(Number.isNaN(huisnummer) || huisnummer.length == 0) missing.add('huisnummer');
	});

	missing = Array.from(missing);

	if(missing.length > 0 ) {
		logger.debug(`Entries missing ${missing.join(', ')}`);
		throw {type: 'warning', message: `Some entries are missing the following: ${missing.join(', ')}`};
	}
	else {
		logger.debug('No required values are missing');
		return data;
	}
};

/**
 * Checks if a document already exists in the database
 *
 * @param {String} model - The collection or model to check
 * @param {Object} document - The document to check
 * @param {String[]} keys - A array of strings with the keys to check for
 * @returns {Promise<object[]>} - Promise with the document if nothing exists or an array of documents from the DB
 */
module.exports.exists = function(model, document, keys) {
	return new Promise((resolve, reject) => {

		if(keys || !Array.isArray(keys)) {
			logger.error(new Error('No keys supplied'));
			reject({type: 'error', error: 'No keys supplied'});
		}

		logger.silly(`Checking if the a document with ${keys.join(', ')} exists`);

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

			let checks = keys.map(async key => {
				let check = {[key]: document[key]};
				let data;

				switch(model){
				case 'User': {
					data = await User.findOne(check);
					break;
				}
				case 'Dataset': {
					data = await Dataset.findOne(check);
					break;
				}
				case 'Company': {
					data = await Company.findOne(check);
					break;
				}
				case 'Building': {
					data = await Building.findOne(check);
					break;
				}
				case 'Contract': {
					data = await Contract.findOne(check);
					break;
				}
				}

				return data;

			});

			checks = await Promise.all(checks);

			let unique = checks.every(check => !check);

			if (unique) resolve([document]);
			else {
				let existingDocuments = checks.filter(check => check);
				existingDocuments = [new Set(...existingDocuments)];
				resolve(existingDocuments);
			}

		});
	});
};