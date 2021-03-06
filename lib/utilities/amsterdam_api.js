const axios = require('axios');
// const amsAPI = axios.create({
// 	baseURL: 'https://api.data.amsterdam.nl/gebieden/',
// });
const amsMapsAPI = axios.create({
	baseURL: 'https://maps.amsterdam.nl/open_geodata/'
});

// utilities
const logger = require('#utilities/logger.js').getLogger('API Amsterdam');



function getMapping(mapping) {
	logger.debug(`Getting ${mapping} from map open geo data`);
	return new Promise((resolve, reject) => {
		getFeatureCollection(mapping)
			.then((response) => response.data.features)
			.then((amsAreas) => transform(mapping, amsAreas))
			.then((amsAreas) => resolve(amsAreas))
			.catch((error) => {
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}

function transform(mapping, amsAreas) {

	let mappedAreas = amsAreas.map(async (area) => {
		let { properties } = area;
		let parent = null

		if(mapping === 'buurten') parent = properties.Buurtcombinatie_code;
		if(mapping === 'wijken') parent = properties.Stadsdeel_code;
		if(mapping === 'stadsdelen') parent = 'Amsterdam';


		let mappedArea = {
			name: properties.Buurt || properties.Buurtcombinatie ||  properties.Stadsdeel,
			type: mapping,
			code: properties.Buurt_code || properties.Buurtcombinatie_code || properties.Stadsdeel_code,
			parent,
			m2: properties.Opp_m2,
			contracts: []
		};

		return mappedArea;
	});

	return Promise.all(mappedAreas);
}


function getFeatureCollection(mapping) {
	if (mapping === 'wijken') mapping = 'buurtcombinaties';
	let url = `geojson.php?KAARTLAAG=GEBIED_${mapping.toUpperCase()}&THEMA=gebiedsindeling`;
	
	return amsMapsAPI.get(url);
}



module.exports = {
	getMapping,
	getFeatureCollection
};