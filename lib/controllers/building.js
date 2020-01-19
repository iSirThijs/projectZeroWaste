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
			wijk: data.buurt.slice(0, -1),
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


function sum({buurt = undefined, wijk = undefined, stadsdeel = undefined, datasetID}) {

	let matchFilter = { collectionCompany: datasetID };

	if(buurt && wijk && stadsdeel) throw new Error('Need a mapping');

	if(buurt) matchFilter.buurt = buurt.code;
	if(wijk) matchFilter.wijk = wijk.code;
	if(stadsdeel) matchFilter.stadsdeel = stadsdeel.code;


	return Building.aggregate()
		.match(matchFilter)
		.group({
			_id: null,
			monday: { '$sum': '$contract.monday'},
			tuesday: { '$sum': '$contract.tuesday'},
			wednesday: { '$sum': '$contract.wednesday'},
			thursday: { '$sum': '$contract.thursday'},
			friday: { '$sum': '$contract.friday'},
			saturday: { '$sum': '$contract.saturday'},
			sunday: { '$sum': '$contract.sunday'},
		})
		.project({
			_id: false
		}).then((totals) => {
			if(!totals[0]) return {};
			else return  totals[0];
		}).catch(error => logger.error(error));
}

module.exports = {
	extract,
	sum
};