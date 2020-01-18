require('dotenv').config();
require('link-module-alias');
require('#utilities/database.js').loggerName('Server');

const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const session = require('express-session');

const { createChart } = require('#utilities/chart.js');
const area = require('#controllers/area.js');
const amsAPI = require('#utilities/amsterdam_api.js');


const logger = require('#utilities/logger').getLogger('server');

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
	.get('/', renderHome)
	.use('/register', register)
	.use('/data' ,dataUpload)
	.use('/api', api)
	.use(unhandledErrors)
	.listen(process.env.PORT || 8000);


function setResLocals(req, res, next){
	res.locals.user = true;
	res.locals.links = { datasetManager: true };
	res.locals.notification = undefined;
	next();
}

async function renderHome(req, res) {
	let data = await area.get('stadsdelen');
	let featureCollection = await amsAPI.getFeatureCollection('stadsdelen');

	res.locals.barChart = createChart;
	res.locals.data = data;
	res.locals.featureCollection = featureCollection.data;

	res.render('visualization/chart.ejs' );


}

function unhandledErrors(err, req, res, next){
	logger.error('%o', err);
	res.status(500).send('Oh no an error occurred');
}