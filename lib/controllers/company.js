const mongoose = require('mongoose');

// Utilities
const validate = require('#utilities/data_validation.js');
const logger = require('#utilities/logger.js').getLogger('Company');

// Models
const Company = require('#models/company.js');

module.exports.extractCompany = function(datum){
	return new Promise((resolve, reject) => {
		let kvk = datum.kvknummer || undefined;
		let name = datum.bedrijfsnaam;

		let newCompany = {
			name: datum.bedrijfsnaam,
			kvk: datum.kvknummer || undefined
		};

		if(kvk && !validate.checkKVK(kvk)) kvk = undefined;

		validate.exists('Company', newCompany, ['name'])
			.then((documents) => {
				if(documents && documents.length == 1) {
					logger.debug('Company already exists');
					logger.debug('Company: %o', documents[0]);
					return documents[0]._id;
				} else if (!documents) {
					logger.debug('Company doesn\'t exists');
					return saveCompany(newCompany);
				}
			})
			.then((companyID) => resolve(companyID))
			.catch(error => {
				reject({type: 'error', error});
			});


	});
};


function saveCompany(newCompany){
	return new Promise(function(resolve, reject) {
		logger.debug(`Saving company: ${newCompany.name}`);

		let modeledCompany = new Company(newCompany);

		modeledCompany.save((error, savedCompany) => {
			if (error) {
				logger.error(error);
				reject({type: 'error', data: error});
			}
			else {
				logger.debug('Saved company');
				logger.silly('dataset: %o', savedCompany);
				resolve(savedCompany._id);}
		});
	});
}