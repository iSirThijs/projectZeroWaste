const express = require('express');
const router = express.Router();
const path = require('path');
const log = require('@utilities/other/logger.js').getLogger('dataset manager');
const notification = require('@utilities/other/notifications.js');

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
const upload = multer({storage: storage, fileFilter: fileFilter });

// Dataset Metadata Module
const dataset = require('@utilities/data/dataset.js');

// Child Process for data processing
const {fork} = require('child_process');
const queue = fork('lib/utilities/queue/queue.js');

// Routes
router
	.get('/', renderManager)
	.post('/', upload.single('csv'), processUpload)
	.use(uploadErrors);

module.exports = router;

// GET Handlers
function renderManager(req, res) {
	res.render('dataset_manager/dataset_manager.ejs');
	// queue.on('message', handleMsg);
	// queue.send({type: 'status'});

	// function handleMsg(msg) {
	// 	queue.removeListener('message', handleMsg);
	// 	res.locals.tasks = msg.content.length;
	// 	res.locals.tasklist = msg.content;
	// 	res.render('dataset_manager/dataset_manager.ejs');
	// }
}

// POST Handlers
function processUpload(req, res, next) {
	let file = req.file;
	let { company } = req.body;

	if(!file) next(new Error('NoCSV'));
	else if(!company) next(new Error('NoCompanyName'));
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

		dataset.checkExistence(newDataSet)
			.then((newDataSet) => dataset.register(newDataSet))
			.then((savedDataset) => {
				queue.send({type: 'task', task: 'add', dataset: savedDataset });
				res.locals.notification = notification.success('The file is uploaded and added to the task queue');
				renderManager(req, res);
			})
			.catch(err => next(err));
	}
}

// Local Error Handlers
// eslint-disable-next-line no-unused-vars
function uploadErrors(err, req, res, next) {
	res.locals.tasks = 0;
	res.locals.tasklist = [];

	switch (err.message) {
	case 'NoCSV': {
		log.silly(err);	
		res.locals.notification = notification.warning('There was no file or the file was not a CSV file');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	case 'NoCompanyName': {
		log.silly(err);	
		res.locals.notification = notification.warning('Please supply a company name');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	case 'DatasetExists': {
		log.silly(err);
		res.locals.notification = notification.warning('There already is a dataset for this company');
		res.render('dataset_manager/dataset_manager.ejs');
		break;
	}
	default: {
		res.locals.notification = notification.error();
		res.render('dataset_manager/dataset_manager.ejs');
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