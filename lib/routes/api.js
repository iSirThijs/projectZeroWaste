//Express Router
const express = require('express');
const router = express.Router();

// controllers
const building = require('#controllers/building.js');
const area = require('#controllers/area.js');

// Utilities
const logger = require('#utilities/logger.js').getLogger('api');
const notification = require('#utilities/notifications.js');


router
	.get('/chart', getChartData);


module.exports = router;


async function getChartData(req, res, next) {
	let { collectionCompany = 'all', mapping = 'stadsdeel'} = req.query;

	res.send(await area.get(mapping));
	
}