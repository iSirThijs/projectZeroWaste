require('dotenv').config();
require('link-module-alias');
require('#utilities/database.js').loggerName('Server');

const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const chart = require('#utilities/chart.js');
const area = require('#controllers/area.js');
const job = require('#controllers/job.js');
const amsAPI = require('#utilities/amsterdam_api.js');


const logger = require('#utilities/logger.js').getLogger('server');
const chartsData = require('#utilities/charts_data.js');

// routes
const register = require('#routes/register.js');
const dataUpload = require('#routes/dataset_manager.js');
const api = require('#routes/api');


server
	.use('/public', express.static('./public'))
	.use(bodyParser.urlencoded({ extended: true}))
	.use(session({
		resave: false, // checked session docs, false is best option(for now)
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET
	}))
	.set('view engine', 'ejs')
	.set('views', './lib/views' )
	.use(setResLocals)
	.get('/', (req, res, next) => res.redirect('/context?mapping=buurten&day1=total&compare=true&day2=total'))
	.get('/context?', renderHome)
	// .use('/register', register)
	.use('/data' ,dataUpload)
	// .use('/api', api)
	.use(unhandledErrors)
	.listen(process.env.PORT || 8000);


function setResLocals(req, res, next){
	res.locals.user = true;
	res.locals.links = { datasetManager: true };
	res.locals.notification = undefined;
	next();
}

async function renderHome(req, res) {
	let { mapping, day1 = 'total', day2 = 'total', compare = false } = req.query;
	logger.debug('%o', req.query);

	try {
		let datasets = await job.countLoadedDatasets();
		let featureCollection;
		let categoryData;

		if(datasets.length > 0) {
			featureCollection = await chartsData.amsMapData({mapping});
			categoryData = await chartsData.amsBarChartData();
		} else {
			featureCollection = false;
			categoryData = false;
		}

		// Queries
		res.locals.query1 = {
			day: day1,
			dayNL: translateQuery(day1)
		};
		res.locals.query2 = {
			day: day2,
			dayNL: translateQuery(day2)
		};

		if(compare === 'true' || compare === 'false' ) compare = JSON.parse(compare);

		res.locals.compare = compare ;
		res.locals.mapping = mapping;
		
		// Charts + data
		res.locals.map = chart.map;
		res.locals.featureCollection = featureCollection;

		
		
		res.locals.categoryData = categoryData;
		res.locals.categories = chart.categories;
	
		res.render('visualization/chart.ejs' );

	} catch(error) {
		logger.error(error);
	}
}

function unhandledErrors(err, req, res, next){
	logger.error('%o', err);
	res.status(500).send('Oh no an error occurred');
}


function translateQuery(day) {
	let dayNL;

	switch (day) {
	case 'monday': {
		dayNL = 'Maandag';
		break;
	}
	case 'tuesday': {
		dayNL = 'Dinsdag';
		break;
	}
	case 'wednesday': {
		dayNL = 'Woensdag';
		break;
	}
	case 'thursday': {
		dayNL = 'Donderdag';
		break;
	}
	case 'friday': {
		dayNL = 'Vrijdag';
		break;
	}
	case 'saturday': {
		dayNL = 'Zaterdag';
		break;
	}
	case 'sunday': {
		dayNL = 'Zondag';
		break;
	}
	case 'total': {
		dayNL = 'Totaal';
		break;
	}
	}

	return dayNL;
}