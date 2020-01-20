const logger = require('#utilities/logger.js').getLogger('Controller - Areas');

const building = require('#controllers/building.js');

// models
const Area = require('#models/area.js');

// save 
function save(newArea) {
	return new Promise((resolve, reject) => {

		Area.findOne(newArea)
			.then((document) => {
				if(!document) {
					let model = new Area(newArea);
					return model.save();
				}
				else {
					let { name, type, code, m2 } = newArea;

					document.name = name;
					document.type = type;
					document.code = code;
					document.m2 = m2;

				}
			})
			.then((document) => resolve(document))
			.catch(error => {
				console.log(error)
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}


function get(mapping) {
	return Area.find().where('type').equals(mapping).catch(error => logger.error(error));
}

function totalsBuurt(datasetID) {

	logger.debug('Computing totals for buurt');
	
	return get('buurten')
		.then(buurten => {
		
			logger.debug(`Got ${buurten.length} buurten from DB`);
			logger.debug('Computing totals for this dataset');
			
			let savedBuurten = buurten.map(async (buurt) => {
				logger.silly(`Computing totals for ${buurt.code} - ${buurt.name}`);

				let totals = await building.sum({buurt, datasetID});
				totals.collectionCompany = datasetID;
				logger.silly(`totals for ${buurt.name}: %o`, totals);
				buurt.contracts.push(totals);

				return buurt.save();
			});

			return Promise.all(savedBuurten);
		});
}


function totalsWijk(datasetID) {

	logger.debug('Computing totals for wijk');

	return get('wijken')
		.then(wijken => {

			logger.debug(`Got ${wijken.length} wijken from DB`);
			logger.debug('Computing totals for these wijken');
			
			let savedWijken = wijken.map(async (wijk) => {
				logger.silly(`Computing totals for ${wijk.code} - ${wijk.name}`);

				let totals = await sum({wijk, datasetID});
				totals.collectionCompany = datasetID;
				logger.silly(`totals for ${wijk.name}: %o`, totals);
				wijk.contracts.push(totals);

				return wijk.save();
			});

			return Promise.all(savedWijken);

		});
}

function totalsStadsdeel(datasetID) {
	logger.debug('Computing totals for Stadsdelen');

	return get('stadsdelen')
		.then(stadsdelen => {

			logger.debug(`Got ${stadsdelen.length} stadsdelen from DB`);
			logger.debug('Computing totals for these stadsdelen');
			
			let savedStadsdelen = stadsdelen.map(async (stadsdeel) => {
				logger.silly(`Computing totals for ${stadsdeel.code} - ${stadsdeel.name}`);

				let totals = await sum({stadsdeel, datasetID});
				totals.collectionCompany = datasetID;
				logger.silly(`totals for ${stadsdeel.name}: %o`, totals);
				stadsdeel.contracts.push(totals);

				return stadsdeel.save();
			});

			return Promise.all(savedStadsdelen);

		});
}

async function totalsAmsterdam(datasetID) {
	logger.debug('Computing totals for Amsterdam');
	
	let document = await Area.findOne({code: 'ams'});
	let totals = await sum({amsterdam: true, datasetID});

	totals.collectionCompany = datasetID;

	if(document) {
		document.contracts.push(totals);
		// let grandTotals = sumAllTotals(document.contracts);
		// document.contract.push(grandTotals);

		document.save();
	} else {
		let amsterdam = {
			name: 'Amsterdam',
			type: 'stad',
			code: 'ams',
			parent: null,
			m2: 219490000,
			contracts: [totals]
		};
		let newDoc = new Area(amsterdam);
		newDoc.save();
	}
}

function sum({wijk = undefined, stadsdeel = undefined, amsterdam = false, datasetID}) {

	let matchFilter;

	if(!wijk && !stadsdeel && !amsterdam) throw new Error('Need a mapping');

	if(wijk) matchFilter = { type: 'buurten', parent: wijk.code };
	if(stadsdeel) matchFilter = { type: 'wijken', parent: stadsdeel.code };
	if(amsterdam) matchFilter = { type: 'stadsdelen', parent: 'Amsterdam'};

	return Area.aggregate()
		.match(matchFilter)
		.unwind({path: '$contracts'})
		.match({ 'contracts.collectionCompany': datasetID })
		.group({
			_id: null,
			monday: { '$sum': '$contracts.monday'},
			tuesday: { '$sum': '$contracts.tuesday'},
			wednesday: { '$sum': '$contracts.wednesday'},
			thursday: { '$sum': '$contracts.thursday'},
			friday: { '$sum': '$contracts.friday'},
			saturday: { '$sum': '$contracts.saturday'},
			sunday: { '$sum': '$contracts.sunday'},
			total: { '$sum': '$contracts.total'}
		})
		.project({
			_id: false
		}).then((totals) => {
			if(!totals[0]) return { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0, total: 0 };
			else return totals[0];
		}).catch(error => logger.error(error));
}


module.exports = {
	save,
	get,
	totals: {
		buurt: totalsBuurt,
		wijk: totalsWijk,
		stadsdeel:  totalsStadsdeel,
		amsterdam: totalsAmsterdam
	}
};