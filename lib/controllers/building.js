// Utilities
const logger = require('#utilities/logger.js').getLogger('Controller - Building');

// Models
const Building = require('#models/building.js');

function extract(data, datasetID, companyID) {
	return new Promise((resolve, reject) => {
		let {ma = 0, di = 0, wo = 0, do: don = 0, vr = 0, za = 0, zo = 0 } = data;
		let total = parseInt(ma) || 0 + parseInt(di) || 0 + parseInt(wo) || 0+ parseInt(don) || 0+ parseInt(vr) || 0 + parseInt(za) || 0 + parseInt(zo) || 0;
		
		let newBuilding = {
			company: companyID,
			collectionCompany: datasetID,
			street: data.straat,
			number: data.huisnummer,
			suffix: data.toevoeging || undefined,
			postalCode: data.postcode,
			category: findCategory(data.sbi_hoofdcode),
			sbiMain: data.sbi_hoofdcode || undefined,
			sbiCode: data.sbi_code || undefined,
			stadsdeel: data.stadsdeel || undefined,
			wijk: data.buurt.slice(0, -1),
			buurt: data.buurt || undefined,
			ggw: data.ggw || undefined,
			contract: {
				monday: ma || 0,
				tuesday: di || 0,
				wednesday: wo || 0,
				thursday: don || 0,
				friday: vr || 0,
				saturday: za || 0,
				sunday: zo || 0,
				total
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


function findCategory(sbiMain) {
	if(sbiMain.match(/^(A|B|C|D|E|F)\d?$/)) return 'Productie en winning';
	if(sbiMain.match(/^(G|I|L)\d?$/)) return 'Handel en verkoop';
	if(sbiMain.match(/^(H|P|Q|R|S|T)\d?$/)) return 'Sociale dienstverlening';
	if(sbiMain.match(/^(J|K|M|N|O|U)\d?$/)) return 'Financiële dienstverlening';
	return 'Geen Categorie';
}


function sumDays({buurt, datasetID}) {

	let matchFilter = { collectionCompany: datasetID };

	if(!buurt) throw new Error('Need a buurt');

	matchFilter.buurt = buurt.code;


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
			if(totals.length === 0 )return { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0, total: 0 };
			else return totals[0];
		}).catch(error => logger.error(error));
}

function sumCategory({buurt, datasetID}) {

	let matchFilter = { collectionCompany: datasetID };

	if(!buurt) throw new Error('Need a buurt');

	matchFilter.buurt = buurt.code;


	return Building.aggregate()
		.match(matchFilter)
		.group({
			_id: '$category',
			monday: { '$sum': '$contract.monday'},
			tuesday: { '$sum': '$contract.tuesday'},
			wednesday: { '$sum': '$contract.wednesday'},
			thursday: { '$sum': '$contract.thursday'},
			friday: { '$sum': '$contract.friday'},
			saturday: { '$sum': '$contract.saturday'},
			sunday: { '$sum': '$contract.sunday'},
			total: { '$sum': '$contract.total'}
		})
		.then((totals) => totals)
		.catch(error => logger.error(error));
}


module.exports = {
	extract,
	sum: {days: sumDays, categories: sumCategory }
};