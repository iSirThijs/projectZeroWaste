const axios = require('axios');
const amsAPI = axios.create({
	baseURL: 'https://api.data.amsterdam.nl/gebieden/',
});

// utilities
const logger = require('#utilities/logger.js').getLogger('API Amsterdam');



function getMapping(mapping) {
	logger.debug(`Getting ${mapping} from api.data.amsterdam/gebieden/`);
	return new Promise((resolve, reject) => {
		let url = `${mapping}?page_size=500`;

		amsAPI.get(url)
			.then((response) => response.data.results)
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
		let link = area._links.self.href;
		let response = await axios.get(link);
		let details = response.data;

		let code;
		if (mapping === 'stadsdeel' || mapping === 'ggw') code = details.code;
		else code = details.volledige_code;

		let mappedArea = {
			name: details.naam,
			type: mapping,
			code: code,
			contracts: [],
			geometry: details.geometrie.coordinates,
		};

		return mappedArea;
	});

	return Promise.all(mappedAreas);
}


module.exports = {
	getMapping
};