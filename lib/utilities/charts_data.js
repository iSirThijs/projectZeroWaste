
// controllers
const area = require('#controllers/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Charts Data');
const amsAPI = require('#utilities/amsterdam_api.js');
const compute = require('#utilities/compute.js');



async function getAMSmapdata(mapping) {

	// get featureCollection with right mapping
	let { data: featureCollection } = await amsAPI.getFeatureCollection(mapping);
	
	// get data for mapping
	let mappingData = await area.get(mapping);


	let data = featureCollection.features.map((feature) => {
		let datum = mappingData.find((datum) => {
			if(feature.properties.Buurt_code && datum.code === feature.properties.Buurt_code) return true;
			else if(feature.properties.Buurtcombinatie_code && datum.code === feature.properties.Buurtcombinatie_code) return true;
			else if(feature.properties.Stadsdeel_code && datum.code === feature.properties.Stadsdeel_code) return true;
			else return false;
		});

		let sum = compute.sumDatasets.days(datum.computations);
		let averagesKM2 = compute.averages.km2(sum, datum.m2);
		let categories = compute.sumDatasets.categories(datum.computations);

		let newComputation = {
			collectionCompany: 'all',
			sum,
			averagesKM2,
			categories
		};

		datum.computations.push(newComputation);

		feature.properties.computations = datum.computations;

		return feature;

	});

	featureCollection.features = data;

	return featureCollection;

}

async function getAmsData() {
	let data = await area.getAMS();


	let sum = compute.sumDatasets.days(data.computations);
	let averagesKM2 = compute.averages.km2(sum, data.m2);
	let categories = compute.sumDatasets.categories(data.computations);

	let newComputation = {
		collectionCompany: 'all',
		sum,
		averagesKM2,
		categories
	};

	data.computations.push(newComputation);
	return data;
}


async function getData(mapping) {
	let mappingData = await area.get(mapping);

	return mappingData.map((datum) => {
		let sum = compute.sumDatasets.days(datum.computations);
		let averagesKM2 = compute.averages.km2(sum, datum.m2);
		let categories = compute.sumDatasets.categories(datum.computations);

		let newComputation = {
			collectionCompany: 'all',
			sum,
			averagesKM2,
			categories
		};

		datum.computations.push(newComputation);
		
		return datum;
	});

}



module.exports = {
	mapData: getAMSmapdata,
	amsData: getAmsData,
	data: getData
};
