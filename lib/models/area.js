const { Schema, model } = require('mongoose');

const areaSchema = new Schema({
	name: { 
		type: String, 
		required: true,
	},
	type: { 
		type: String, 
		required: true,
		enum: ['stadsdeel', 'ggw', 'wijk', 'buurt']
	},
	code: { 
		type: String, 
		required: true
	},
	contracts: [],
	geometry: { 
		type: Array, 
		required: true
	}
});

const Area = model('area', areaSchema, 'areas');

module.exports = Area;
