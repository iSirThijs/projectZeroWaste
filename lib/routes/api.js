//Express Router
const express = require('express');
const router = express.Router();

// controllers
const building = require('#controllers/building.js');

// Utilities
const logger = require('#utilities/logger.js').getLogger('api');
const notification = require('#utilities/notifications.js');
const amsAPI = require('#utilities/amsterdam_api');


router
	.get('/chart', getChartData);


module.exports = router;


function getChartData(req, res, next) {
	let { collectionCompany = 'all', mapping = 'stadsdeel'} = req.query;

	// get the mapping from amsterdam (stadsdeel, buurtcombinatie, buurt)
	amsAPI.getMapping(mapping)
		.then((amsAreas) => building.getContractsAreas(amsAreas))
		.then((amsAreas) => res.send(amsAreas))
		
		.catch(error => logger.error(error));

	// get the data from the database (with collectioncompany)
	// combine and transform into object/map
	// send back (res)


}