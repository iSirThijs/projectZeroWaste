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
	return Area.find().where('type').equals(mapping).catch(error => logger.log(error));
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

			logger.debug(`Got ${wijken.length} buurten from DB`);
			logger.debug('Computing totals for this dataset');
			
			let savedWijken = wijken.map(async (wijk) => {
				logger.silly(`Computing totals for ${wijk.code} - ${wijk.name}`);

				// let totals = await building.sum({wijk, datasetID});
				
				totals.collectionCompany = datasetID;

				logger.silly(`totals for ${wijk.name}: %o`, totals);
				
				wijk.contracts.push(totals);
				return wijk.save();
			});

			return Promise.all(savedWijken);

		});
}

function sumBuurten({wijk = undefined, stadsdeel = undefined, datasetID}) {

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
	save,
	get,
	totals: {
		buurt: totalsBuurt,
		wijk: totalsWijk
	}
};