const express = require('express');
const router = express.Router();
const path = require('path');
const log = require('../utilities/logger.js').getLogger('data-upload');
const notification = require('../utilities/notifications.js');

// Multer for uploading the CSV
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './data/tmp-upload');
	},
	filename: function(req, file, cb) {
		let user = req.session.id || 'guest';
		cb(null, 'data_upload_' + user + '_' + Date.now() + '.csv');
	}
});
const upload = multer({storage: storage, fileFilter: fileFilter });

// Data processing for uploaded CSV
const dataset = require('../utilities/datasets.js');
const {fork} = require('child_process');
const workerTasklist = fork('./lib/utilities/child-apps/tasklist.js');

// Routes
router
	.get('/', renderManager)
	.post('/', upload.single('csv'), processUpload)
	.use(uploadErrors);

module.exports = router;

// GET Handlers
function renderManager(req, res) {
	workerTasklist.on('message', handleMsg);
	workerTasklist.send({type: 'tasklist'});

	function handleMsg(msg) {
		console.log(msg.content);
		workerTasklist.removeListener('message', handleMsg);
		res.locals.tasks = msg.content.length;
		res.locals.tasklist = msg.content;
		res.render('data-manager');
	}
}


// POST Handlers
function processUpload(req, res, next) {
	let file = req.file;
	let { company } = req.body;

	if(!file) next(new Error('NoCSV'));
	else if(!req.body.company) next(new Error('NoCompanyName'));
	else {
		// check existence of company and dataset!

		let { originalname, filename, path } = file;

		let newDataSet = {
			originalname,
			company,
			filename,
			path,
			// user: req.session.id,
			status: 'queue'
		};

		dataset.register(newDataSet)
			.then((dataSet) => {
				workerTasklist.send({type: 'task', task: 'addData', content: dataSet });
				res.locals.notification = notification.success('The file is uploaded and added to the task queue');
				renderManager(req, res);
			})
			.catch(err => next(err));
	}
}

// Local Error Handlers
function uploadErrors(err, req, res, next) {
	switch (err.message) {
	case 'NoCSV': {
		log.silly(err);	
		res.locals.notification = notification.warning('There was no file or the file was not a CSV file');
		res.render('data-manager');
		break;
	}
	case 'NoCompanyName': {
		log.silly(err);	
		res.locals.notification = notification.warning('Please supply a company name');
		res.render('data-manager');
		break;
	}
	default: {
		log.error(err);	
		res.locals.notification = notification.error();
		res.render('data-manager');
		break;
	}
	}
}


// Other Functions
function fileFilter(req, file, cb) {
	let filetypes = /(text\/)?\.?(csv)/;
	let excel = /application\/vnd\.ms-excel/;
	let mimeType = filetypes.test(file.mimetype) || excel.test(file.excel);
	let extension = filetypes.test(path.extname(file.originalname).toLowerCase());

	log.debug(`File ${file.originalname} uploaded attempt by ${req.session.username || 'guest'}`);
	log.debug(`mimeType: ${mimeType} (${file.mimetype}), extension ${extension} (${path.extname(file.originalname).toLowerCase()})`);

	if (mimeType && extension) cb(null, true);
	else cb(new Error('NoCSV'));
}