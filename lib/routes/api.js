//Express Router
const express = require('express');
const router = express.Router();

// controllers
const chartsData = require('#utilities/charts_data.js');

// Utilities
const logger = require('#utilities/logger.js').getLogger('api');


router
	.get('/mapdata', sendMapData)
	.get('/data', sendData);


module.exports = router;


async function sendMapData(req, res, next) {
	let { mapping = 'buurten'} = req.query;
	
	let featureCollection = await chartsData.amsMapData(mapping);

	res.status(200).send(featureCollection);
	
}

async function sendData(req, res, next) {
	let { mapping = 'buurten'} = req.query;

	let categoryData = await chartsData.data(mapping);
	res.status(200).send(categoryData);
}