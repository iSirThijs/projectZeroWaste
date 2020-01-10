//Express Router
const express = require('express');
const router = express.Router();

// Utilities
const _path = require('path');
const fs = require('fs').promises;
const logger = require('#utilities/logger.js').getLogger('datasetManager');
const notification = require('#utilities/notifications.js');

// CSV Uploading
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './data/csv_files');
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
	let extension = filetypes.test(_path.extname(file.originalname).toLowerCase());

	logger.debug(`File ${file.originalname} uploaded attempt by ${req.session.username || 'guest'}`);
	logger.debug(`mimeType: ${mimeType} (${file.mimetype}), extension ${extension} (${_path.extname(file.originalname).toLowerCase()})`);

	if (mimeType && extension) cb(null, true);
	else cb(new Error('NoCSV'));
};
const upload = multer({storage: storage, fileFilter: fileFilter });

// Dataset controller
const job = require('#controllers/job.js');

// Routes
router
	.get('/', renderDatasetManager)
	.post('/', upload.single('csv'), validateUpload, processUpload)
	.use(datasetManagerErrors);

module.exports = router;

// GET Handlers
function renderDatasetManager(req, res, next){
	job.getJobs()
		.then((jobs) => res.locals.jobs = jobs)
		.then(() => res.render('dataset_manager/dataset_manager.ejs'));
}

// POST Handlers
async function validateUpload(req, res, next){
	let { collectionCompany } = req.body;
	let { originalname, path } = req.file;

	let existsColCompany = await job.exists({ 'dataset.collectionCompany': collectionCompany });
	let existsOriName = await job.exists({ 'dataset.originalname': originalname });

	if(!req.file) next(new Error('NoCSV'));
	else if(!collectionCompany) {
		removeTempUpload(path);
		next(new Error('NoCompanyName'));
	}
	else if( existsColCompany || existsOriName) {
		removeTempUpload(path);
		next(new Error('DatasetExists'));
	}
	else next();
}

function processUpload(req, res, next) {
	let { collectionCompany } = req.body;
	let { originalname, path } = req.file;

	// check if already exists


	// create and save model to db1
	job
		.save(collectionCompany, originalname, path)
		.then((jobID) => logger.debug(`Saved job with ID ${jobID}`))
		.then(() => {
			res.locals.notification = notification.success('Dataset uploaded and added to queue')
			renderDatasetManager(req, res, next);
			// notify job queue 
		} )
		.catch(() => {
			removeTempUpload(path);
			res.locals.notification = notification.error();
			renderDatasetManager(req, res, next);
		});

}

function removeTempUpload(path) {
	return fs.unlink(path).catch(error => logger.error(error));
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