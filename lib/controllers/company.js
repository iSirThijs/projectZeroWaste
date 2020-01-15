const mongoose = require('mongoose');

// Utilities
const validate = require('#utilities/data_validation.js');
const logger = require('#utilities/logger.js').getLogger('Controller - Company');

// Models
const Company = require('#models/company.js');


function extract(data, datasetID) {
	return new Promise((resolve, reject) => {

		// if(data.kvknummer && !validate.checkKVK(data.kvknummer)) reject({type: 'warning', message: `Het bedrijf met naam: ${data.bedrijfsnaam} heeft geen geldig kvk nummer: ${data.kvknummer}`});

		let newCompany = {
			name: data.bedrijfsnaam,
			collectionCompany: [datasetID],
			kvk: data.kvknummer || undefined
		};

		exists(newCompany)
			.then((document) => {
				if(!document) {
					let model = new Company(newCompany);
					return model.save();
				}
				else {
					document.altNames.push(data.name);
					document.collectionCompany.push(datasetID);
					if (!document.kvk) document.kvk = data.kvknummer;
					return document.save();
				}
			})
			.then((document) => resolve(document._id))
			.catch(error => {
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}


function exists(newCompany) {
	return new Promise((resolve, reject) => {
		
		Company.findOne()
			.or([{name: newCompany.name}, {altNames: newCompany.name}])
			.then((document) => {
				if(document) resolve(document);
				else if (newCompany.kvk) return Company.findOne({kvk: newCompany.kvk});
				else resolve(document);
			})
			.then((document) => {
				if(document) resolve(document);
				else resolve(false);
			})
			.catch((error) => reject(error));
	});
}


module.exports = {
	extract
};