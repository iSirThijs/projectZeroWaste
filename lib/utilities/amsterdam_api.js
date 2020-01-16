const axios = require('axios');
const amsAPI = axios.create({
	baseURL: 'https://api.data.amsterdam.nl/gebieden/',
});

// utilities
const logger = require('#utilities/logger.js').getLogger('API Amsterdam');



function getMapping(mapping) {
	return new Promise((resolve, reject) => {
		let url = `${mapping}?page_size=500`;

		amsAPI.get(url)
			.then((response) => response.data.results) // get the acutal results
			.then((amsAreas) => transform(mapping, amsAreas))
			.then((amsAreas) => resolve(amsAreas))
			.catch((error) => reject(error));// map with more detail
	});
}

function transform(mapping, amsAreas) {
	let mappedAreas = amsAreas.map(async (area) => {
		try {
			let link = area._links.self.href;
			let response = await axios.get(link);
			let details = response.data;
	
			let mappedArea = {
				code: details.code,
				name: details.naam,
				geometry: details.geometrie.coordinates,
			};
	
			return mappedArea;
		} catch(error) {
			logger.error(error);
			throw error;
		}
	});

	return Promise.all(mappedAreas);
}


module.exports = {
	getMapping
};