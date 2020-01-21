const logger = require('#utilities/logger.js').getLogger('Controller - Areas');

const building = require('#controllers/building.js');
const compute = require('#utilities/compute.js');

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
				console.log(error);
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}

function countCollection(){
	return Area.find()
		.then((areas) => areas.length)
		.catch((error) => {
			logger.error(error);
			throw {type: 'error', error};
		});
}

function get(mapping) {
	return Area.find().where('type').equals(mapping)
		.catch(error => {
			logger.error(error);
			throw {type: 'error', error};
		});
}

// Computations
function computationBuurt(datasetID) {

	logger.debug('Computing totals for buurt');
	
	return get('buurten')
		.then(buurten => {
		
			logger.debug(`Got ${buurten.length} buurten from DB`);
			logger.debug('Computing totals for this dataset');
			
			let savedBuurten = buurten.map(async (buurt) => {
				logger.silly(`Computing totals for ${buurt.code} - ${buurt.name}`);

				let sum = await building.sum.days({buurt, datasetID});
				let averageKM2 = compute.averages.km2(sum, buurt .m2);
				let categories = await building.sum.categories({id: '$categories', buurt, datasetID});
				

				let newComputations = {
					collectionCompany: datasetID,
					sum,
					averageKM2,
					categories,
				};

				buurt.computations.push(newComputations);

				
				return buurt.save();
			});

			return Promise.all(savedBuurten);
		})
		.catch(error => {
			logger.error(error);
			throw {type: 'error', error};
		});
}

function computationWijk(datasetID) {

	logger.debug('Computing totals for wijk');

	return get('wijken')
		.then(wijken => {

			logger.debug(`Got ${wijken.length} wijken from DB`);
			logger.debug('Computing totals for these wijken');
			
			let savedWijken = wijken.map(async (wijk) => {
				logger.silly(`Computing totals for ${wijk.code} - ${wijk.name}`);

				let sum = await compute.sum.days({wijk, datasetID});
				let averageKM2 = compute.averages.km2(sum, wijk.m2);
				let categories = await compute.sum.categories({id: '$categories', wijk, datasetID});
				
				let newComputations = {
					collectionCompany: datasetID,
					sum,
					averageKM2,
					categories,
				};

				wijk.computations.push(newComputations);

				return wijk.save();
			});

			return Promise.all(savedWijken);

		})
		.catch(error => {
			logger.error(error);
			throw {type: 'error', error};
		});
}

function computationStadsdeel(datasetID) {
	logger.debug('Computing totals for Stadsdelen');

	return get('stadsdelen')
		.then(stadsdelen => {

			logger.debug(`Got ${stadsdelen.length} stadsdelen from DB`);
			logger.debug('Computing totals for these stadsdelen');
			
			let savedStadsdelen = stadsdelen.map(async (stadsdeel) => {
				logger.silly(`Computing totals for ${stadsdeel.code} - ${stadsdeel.name}`);
	
				let sum = await compute.sum.days({stadsdeel, datasetID});
				let averageKM2 = compute.averages.km2(sum, stadsdeel.m2);
				let categories = await compute.sum.categories({id: '$categories', stadsdeel, datasetID});
				
				let newComputations = {
					collectionCompany: datasetID,
					sum,
					averageKM2,
					categories,
				};

				stadsdeel.computations.push(newComputations);

				return stadsdeel.save();
			});

			return Promise.all(savedStadsdelen);

		})
		.catch(error => {
			logger.error(error);
			throw {type: 'error', error};
		});
}

async function computationAmsterdam(datasetID) {
	logger.debug('Computing totals for Amsterdam');
	
	try {
		let amsterdam = await Area.findOne({code: 'ams'});

		let sum = await compute.sum.days({amsterdam: true, datasetID});
		let categories = await compute.sum.categories({id: '$categories', amsterdam: true, datasetID});
	
		let newComputations = {
			collectionCompany: datasetID,
			sum,
			categories,
		};
		
		if(amsterdam) {
			
			let averageKM2 = compute.averages.km2(sum, amsterdam.m2);
			newComputations.averageKM2 = averageKM2;
			amsterdam.computations.push(newComputations);
			
			return amsterdam.save();
		} else {
			let newAmsterdam = {
				name: 'Amsterdam',
				type: 'stad',
				code: 'ams',
				parent: null,
				m2: 219490000,
				computations: [newComputations]
			};

			let averageKM2 = compute.averages.km2(sum, newAmsterdam.m2);
			newComputations.averageKM2 = averageKM2;
	
			let newDoc = new Area(newAmsterdam);
			return newDoc.save();
		}
	} catch(error) {
		logger.error(error);
		throw {type: 'error', error};
	}
}

function computeAll(datasetID) {
	return computationBuurt(datasetID)
		.then(() => computationWijk(datasetID))
		.then(() => computationStadsdeel(datasetID))
		.then(() => computationAmsterdam(datasetID));
}


module.exports = {
	save,
	get,
	count: countCollection,
	compute: {
		all: computeAll,
		buurt: computationBuurt,
		wijk: computationWijk,
		stadsdeel:  computationStadsdeel,
		amsterdam: computationAmsterdam
	}
};