const { Schema, model } = require('mongoose');

const datasetSchema = new Schema({
	originalname: String,
	company: String,
	filename: String,
	path: String,
	// user: {type: Schema.Types.ObjectId, ref: 'User'},
	status: String,
});

const Dataset = model('Dataset', datasetSchema, 'datasets');

module.exports = Dataset;