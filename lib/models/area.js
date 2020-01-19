const { Schema, model } = require('mongoose');

const areaSchema = new Schema({
	name: { 
		type: String, 
		required: true,
	},
	type: { 
		type: String, 
		required: true,
		enum: ['stadsdelen', 'wijken', 'buurten']
	},
	code: { 
		type: String, 
		required: true
	},
	parent: {
		type: String,
		required: true,
	},
	contracts: [],
	m2: Number
});

const Area = model('area', areaSchema, 'areas');

module.exports = Area;
