//Express Router
const express = require('express');
const router = express.Router();

// Utilities
const path = require('path');
const logger = require('#utilities/logger.js').getLogger('datasetManager');
const notification = require('#utilities/notifications.js');

// CSV Uploading
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
const fileFilter = function(req, file, cb) {
	let filetypes = /(text\/)?\.?(csv)/;
	let excel = /application\/vnd\.ms-excel/;
	let mimeType = filetypes.test(file.mimetype) || excel.test(file.excel);
	let extension = filetypes.test(path.extname(file.originalname).toLowerCase());

	logger.debug(`File ${file.originalname} uploaded attempt by ${req.session.username || 'guest'}`);
	logger.debug(`mimeType: ${mimeType} (${file.mimetype}), extension ${extension} (${path.extname(file.originalname).toLowerCase()})`);

	if (mimeType && extension) cb(null, true);
	else cb(new Error('NoCSV'));
};
const upload = multer({storage: storage, fileFilter: fileFilter });

// Dataset controller
const dataset = require('#controllers/dataset.js');

// Job-queue controller
const {fork} = require('child_process');
const jobQueue = fork('lib/job-queue.js');

// Routes
router
	.get('/', (req, res) => res.render('dataset_manager/dataset_manager.ejs'))
	.post('/', upload.single('csv'), validateUpload, processUpload)
	.use(datasetManagerErrors);

module.exports = router;

// GET Handlers

// POST Handlers
function validateUpload(req, res, next){
	let file = req.file;
	let { company } = req.body;

	if(!file) next(new Error('NoCSV'));
	else if(!company) next(new Error('NoCompanyName'));
	else next();
}

function processUpload(req, res, next) {
	let { company } = req.body;
	let { originalname, filename, path } = req.file;
	
	let newDataSet = {
		originalname,
		company,
		filename,
		path,
		// user: req.session.id,
		status: 'queue'
	};

	logger.silly('dataset: %o', newDataSet);

	dataset.exists(newDataSet)
		.then((newDataSet) => dataset.saveMetadata(newDataSet))
		.then((savedDataset) => {
			jobQueue.send({instruction: 'addJob', job: 'addDataset', dataset: savedDataset });
			res.locals.notification = notification.success('The file is uploaded and added to the job queue');
			res.render('dataset_manager/dataset_manager.ejs');
		})
		.catch(err => next(err));
}

// Route Error Handler
function datasetManagerErrors(err, req, res, next) {
	switch (err.message) {
	case 'NoCSV': {
		logger.silly(err);	
		res.locals.notification = notification.warning('There was no file or the file was not a CSV file');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	case 'NoCompanyName': {
		logger.silly(err);	
		res.locals.notification = notification.warning('Please supply a company name');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	case 'DatasetExists': {
		logger.silly(err);
		res.locals.notification = notification.warning('There already is a dataset for this company');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	default: {
		logger.error(err);
		res.locals.notification = notification.error();
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	}
}