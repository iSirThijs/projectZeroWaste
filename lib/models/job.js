const { Schema, model } = require('mongoose');
// const { Job } = require('#controllers/job');

const jobSchema = new Schema({
	_id: {
		type: Schema.Types.ObjectId,
		select: true,
	},
	type: {
		type: String,
		select: true,
		enum: ['addDataset', 'removeDataset'],
		required: [true, 'I need to know what to do']},
	status: {
		type: String,
		select: true,
		enum: ['queue, running, failed, done'],
		required: [true, 'Need a status']
	},
	failReason: {
		type: String,
		select: true,
		required: [function(){
			return this.status === 'failed';
		}, 'Need a fail reason if status is failed']
	},
	dataset: datasetSchema,
});


const datasetSchema = new Schema({
	originalname: String,
	path: {
		type: String,
		select: true,
	},
	collectionCompany: {
		type: String,
		select: true,
		required: [true, 'CollectionCompany is required']
	},
	// uploadedBy: {type: Schema.Types.ObjectId, ref: 'User'},
},{ _id: false });



// jobSchema.loadClass(Job);



module.exports = model('Job', jobSchema);