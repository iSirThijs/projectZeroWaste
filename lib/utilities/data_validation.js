const log = require('@utilities/other/logger.js').getLogger('data validation');

function checkRequiredColumns(data) {
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

	if (required) {
		log.debug('All required columns are present');
		return data;
	}
	else throw {type: 'warning', message: `Missing columns: ${missing.join(', ')}`};
}

function checkRequiredValues(data) {
	let missing = new Set();

	data.forEach((datum) => {
		let {bedrijfsnaam, straat, huisnummer, postcode } = datum;
		
		if(!bedrijfsnaam || bedrijfsnaam.length == 0 || bedrijfsnaam == '') missing.add('bedrijfsnaam');
		if(!straat || straat.length <= 3 || straat == '') missing.add('straat');
		if(!postcode || postcode.length <= 3 || postcode == '') missing.add('postcode');
	
		if(!huisnummer || huisnummer == '') missing.add('huisnummer');
		huisnummer = Number.parseInt(huisnummer);
		if(Number.isNaN(huisnummer) || huisnummer.length == 0) missing.add('huisnummer');
	});

	missing = Array.from(missing);

	log.silly(missing.join(', '));

	if(missing.length > 0 ) throw {type: 'warning', message: `Some entries are missing the following: ${missing.join(', ')}`};
	else {
		log.debug('No required values are missing');
		return data;
	}
}


module.exports = {
	checkRequiredColumns,
	checkRequiredValues
}