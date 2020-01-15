// Utilities
const validate = require('#utilities/data_validation.js');
const logger = require('#utilities/logger.js').getLogger('Controller - Building');

// Models
const Building = require('#models/building.js');

function extract(data, datasetID, companyID) {
	return new Promise((resolve, reject) => {

		let newBuilding = {
			company: companyID,
			collectionCompany: [datasetID],
			street: data.straat,
			number: data.huisnummer,
			suffix: data.toevoeging || undefined,
			postalCode: data.postcode,
			sbiMain: data.sbi_hoofdcode || undefined,
			sbiCode: data.sbi_code || undefined,
		};

		exists(newBuilding)
			.then((document) => {
				if(!document) {
					let model = new Building(newBuilding);
					return model.save();
				}
				else {
					document.collectionCompany.push(datasetID);
					if (!document.kvkBuilding) document.kvkBuilding = data.vestigingsnummer;
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


function exists(newBuilding) {
	return new Promise((resolve, reject) => {

		let filter = {
			company: newBuilding.company,
			street: newBuilding.street,
			number: newBuilding.number,
			postalCode: newBuilding.postalCode
		};
		
		Building.findOne(filter)
			.then((document) => resolve(document))
			.catch((error) => reject(error));
	});
}


module.exports = {
	extract
};