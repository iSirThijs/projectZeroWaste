const express = require('express');
const router = express.Router();
const path = require('path');
const log = require('../utilities/logger.js').getLogger('data-upload');


const multer = require('multer');
const storage = multer.diskStorage({
	destination: function(req, file, cb){
		cb(null, './data/tmp-upload');
	},
	filename: function(req, file, cb) {
		let user = req.session.username || 'guest';
		cb(null, 'data_upload_' + user + Date.now() + '.csv');
	}
});

const upload = multer({storage: storage, fileFilter: fileFilter });


router
	.get('/', (req, res) => res.render('data-upload/data'))
	.get('/upload', (req, res) => res.render('data-upload/upload'))
	.post('/upload', upload.single('csv'), (req, res) => {
		let file = req.file;
		log.debug(`File saved as ${file.filename} at ${file.destination}`);
		log.debug(`Full path ${file.path}`);
		res.redirect('/data');
	})
	.use(uploadErrors);


module.exports = router;


function fileFilter(req, file, cb) {
	let filetypes = /(text\/)?\.?(csv)/;
	let mimeType = filetypes.test(file.mimetype);
	let extension = filetypes.test(path.extname(file.originalname).toLowerCase());

	log.debug(`File ${file.originalname} uploaded by ${req.session.username || 'guest'}`);
	log.debug(`mimeType: ${mimeType} (${file.mimetype}), extension ${extension} (${path.extname(file.originalname).toLowerCase()})`);

	if (mimeType && extension) cb(null, true);
	else cb(new Error('Not a CSV file'));
}

function uploadErrors(err, req, res, next) {
	if (err.message === 'Not a CSV file') {
		log.debug(err);

		res.locals.notification = {
			type: 'Warning',
			content: 'The file has to be an CSV file'
		};
		res.render('register.ejs');
	}
	else if (err.name === 'ENOENT') {
		log.error(err);

		res.locals.notification = {
			type: 'Error',
			content: 'There was an error with uploading. The file is not uploaded'
		};
		res.render('register.ejs');

	} 
	else if (err instanceof multer.MulterError){
		log.error(err);

		res.locals.notification = {
			type: 'Error',
			content: 'There was an error with uploading.'
		};

		res.render('register.ejs');
	} else next(err);
}