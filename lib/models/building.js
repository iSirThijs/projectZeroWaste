const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
	_id: Schema.Types.ObjectId,
	company: {type: Schema.Types.ObjectId, ref: 'Company'},
	kvkBuilding: Number,
	street: String,
	number: Number,
	suffix: String,
	postalCode: String,
	mainBuilding: Boolean,
	category: String,
	sbiMain: String,
	sbiCode: Array,
});

const Building = model('building', addressSchema, 'buildings');

module.exports = Building;

// virtual for full code, full adress and full area