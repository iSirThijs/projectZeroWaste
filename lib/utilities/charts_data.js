
// controllers
const area = require('#controllers/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Charts Data');
const amsAPI = require('#utilities/amsterdam_api.js');
const compute = require('#utilities/compute.js');



async function getAMSmapdata(queries) {
	let { mapping } = queries;

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



module.exports = {
	amsMapData: getAMSmapdata
};
