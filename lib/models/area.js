const { Schema, model } = require('mongoose');

const areaSchema = new Schema({
	name: { 
		type: String, 
		required: true,
	},
	type: { 
		type: String, 
		required: true,
		enum: ['stad', 'stadsdelen', 'wijken', 'buurten']
	},
	code: { 
		type: String, 
		required: true
	},
	parent: {
		type: String
	},
	m2: Number,
	computations: [] 
});

const Area = model('area', areaSchema, 'areas');

module.exports = Area;
