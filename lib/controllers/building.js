// Utilities
const validate = require('#utilities/data_validation.js');
const logger = require('#utilities/logger.js').getLogger('Controller - Building');

// Models
const Building = require('#models/building.js');

function extract(data, datasetID, companyID) {
	return new Promise((resolve, reject) => {


		if(data.vestigingsnummer && !validate.checkKVKbuilding(data.vestigingsnummer)) reject({type: 'warning', message: `Het bedrijf met naam: ${data.bedrijfsnaam} heeft geen geldig vestigingsnummer ${data.kvknummer}`});

		let newBuilding = {
			company: companyID,
			collectionCompany: [datasetID],
			kvkBuilding: data.vestigingsnummer,
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
				reject(error);
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
		
		Building.findOne({kvkBuilding: newBuilding.kvkBuilding})
			.then((document) => {
				if(document) resolve(document);
				else if (newBuilding.kvk) return Building.findOne(filter);
				else resolve(document);
			})
			.then((document) => {
				if(document) resolve(document);
				else resolve(false);
			})
			.catch((error) => {
				logger.error(error);
				reject(error);
			});
	});
}


module.exports = {
	extract
};