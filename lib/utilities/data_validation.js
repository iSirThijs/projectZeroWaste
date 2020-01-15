const logger = require('#utilities/logger.js').getLogger('Data Validation');
const mongoose = require('mongoose');

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
		'wo',
		'do',		   
		'vr', 
		'za',			   
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
		throw {type: 'warning', message: `De volgende kolommen missen: ${missing.join(', ')}`};
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
		throw {type: 'warning', message: `Sommige records missen waarden voor de volgende kolommen: ${missing.join(', ')}`};
	}
	else {
		logger.debug('No required values are missing');
		return data;
	}
};

module.exports.checkKVK = function(kvknummer) {
	let kvkRegEx = new RegExp(/^\d{8}$/);
	return kvkRegEx.test(kvknummer);
};