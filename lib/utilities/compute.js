
const area = require('#controllers/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Compute');


function totals(loadedJob) {

	logger.debug(`Computing totals for dataset ${loadedJob.dataset.collectionCompany}`);

	return area.totals.buurt(loadedJob._id)
		.then(() => area.totals.wijk(loadedJob._id))
		.then(() => area.totals.stadsdeel(loadedJob._id))
		.then(() => area.totals.amsterdam(loadedJob._id))
		.catch(error => logger.error(error));
}
module.exports = {
	totals
};