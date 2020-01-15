const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
	company: {type: Schema.Types.ObjectId, ref: 'Company', required: true},
	collectionCompany: [{type: Schema.Types.ObjectId, ref: 'Job', required: [true, 'Need this if to remove a dataset']}],
	street: {type: String, required: true},
	number: {type: Number, required: true },
	suffix: {type: String, default: undefined},
	postalCode: {type: String, required: true },
	sbiMain: String,
	sbiCode: Number,
});

const Building = model('building', addressSchema, 'buildings');

module.exports = Building;

// virtual for full code, full adress and full area

// virtual for category