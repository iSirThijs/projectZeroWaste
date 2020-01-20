// Utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Building');

// Models
const Building = require('#models/building.js');

function extract(data, datasetID, companyID) {
	return new Promise((resolve, reject) => {
		let {ma = 0, di = 0, wo = 0, do: don = 0, vr = 0, za = 0, zo = 0 } = data;
		let total = parseInt(ma) + parseInt(di) + parseInt(wo) + parseInt(don) + parseInt(vr) + parseInt(za) + parseInt(zo);
		console.log(total);
		
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
				monday: ma,
				tuesday: di,
				wednesday: wo,
				thursday: don,
				friday: vr,
				saturday: za,
				sunday: zo,
				total: total
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


function sum({buurt, datasetID}) {

	let matchFilter = { collectionCompany: datasetID };

	if(buurt) throw new Error('Need a buurt');

	if(buurt) matchFilter.buurt = buurt.code;


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
			total: { '$sum': '$contract.total'}
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