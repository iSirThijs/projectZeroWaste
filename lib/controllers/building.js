// Utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Building');

// Models
const Building = require('#models/building.js');

function extract(data, datasetID, companyID) {
	return new Promise((resolve, reject) => {

		let newBuilding = {
			company: companyID,
			collectionCompany: datasetID,
			street: data.straat,
			number: data.huisnummer,
			suffix: data.toevoeging || undefined,
			postalCode: data.postcode,
			sbiMain: data.sbi_hoofdcode || undefined,
			sbiCode: data.sbi_code || undefined,
			stadsdeel: data.stadsdeel || undefined,
			buurt: data.buurt || undefined,
			ggw: data.ggw || undefined,
			contract: {
				monday: data.ma || 0,
				tuesday: data.di || 0,
				wednesday: data.wo || 0,
				thursday: data.do || 0,
				friday: data.vr || 0,
				saturday: data.za || 0,
				sunday: data.zo || 0,
			}
		};

		Building.findOne({
			company: newBuilding.company,
			street: newBuilding.street,
			number: newBuilding.number,
			postalCode: newBuilding.postalCode
		})
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

module.exports = {
	extract
};