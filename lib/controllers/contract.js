// Utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Contract');

// Models
const Contract = require('#models/contract.js');

function extract(data, datasetID, companyID, buildingID) {
	return new Promise((resolve, reject) => {

		let newContract = {
			collectionCompany: datasetID,
			company: companyID,
			building: buildingID,
			day: {
				monday: data.ma || 0,
				tuesday: data.di || 0,
				wednesday: data.wo || 0,
				thursday: data.do || 0, 
				friday: data.vr || 0,
				saturday: data.za || 0,
				sunday: data.zo || 0,
			}
		};
			
		let model = new Contract(newContract);
		model.save()
			.then((document) => resolve(document._id))
			.catch((error)=> {
				reject({type: 'error', error});
			});
	});
}

module.exports = {
	extract
};
