const express = require('express');
const router = express.Router();
const path = require('path');
const log = require('../utilities/logger.js').getLogger('data-upload');

const dataset = require('../utilities/datasets.js')
const {fork} = require('child_process');
const datasetProcessor = fork('./lib/utilities/child-apps/data-processor.js');

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


router
	.get('/', renderManager)
	.post('/', upload.single('csv'), processUpload)
	.use(uploadErrors);

module.exports = router;


function renderManager(req, res) {
	res.render('data-manager');
}

function processUpload(req, res, next) {
	let file = req.file;
	let { company } = req.body;
	if(!file) next(new Error('NoCSV'));
	else if(!req.body.company) next(new Error('NoCompanyName'));
	else {
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
				datasetProcessor.send({type: 'task', task: 'addData', content: dataSet });
				renderManager(req, res);
			})
			.catch(err => next(err));
	}
}


function fileFilter(req, file, cb) {
	let filetypes = /(text\/)?\.?(csv)/;
	let excel = /application\/vnd\.ms-excel/;
	let mimeType = filetypes.test(file.mimetype) || excel.test(file.excel);
	let extension = filetypes.test(path.extname(file.originalname).toLowerCase());

	log.debug(`File ${file.originalname} uploaded by ${req.session.username || 'guest'}`);
	log.debug(`mimeType: ${mimeType} (${file.mimetype}), extension ${extension} (${path.extname(file.originalname).toLowerCase()})`);

	if (mimeType && extension) cb(null, true);
	else cb(new Error('NoCSV'));
}

function uploadErrors(err, req, res, next) {
	if (err.message === 'NoCSV') {
		log.debug(err);	
		res.locals.notification = {
			type: 'warning',
			content: 'There was no file or the file was not a CSV file'
		};
		res.render('data-manager');
	}
	else if (err.message === 'NoCompanyName') {
		log.debug(err);	
		res.locals.notification = {
			type: 'warning',
			content: 'Please supply a company name'
		};
		res.render('data-manager');
	}
	else if (err.name === 'ENOENT') {
		log.error(err);	
		res.locals.notification = {
			type: 'error',
			content: 'There was an error with uploading. The file is not uploaded'
		};
		res.render('data-manager');

	} 
	else if (err instanceof multer.MulterError){
		log.error(err);	
		res.locals.notification = {
			type: 'error',
			content: 'There was an error with uploading.'
		};

		res.render('data-manager');
	} else {
		log.error(err);	
		res.locals.notification = {
			type: 'error',
			content: 'There was an error with the app'
		};

		res.render('data-manager');
	}
}
