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
	contracts: [],
	m2: Number
});

areaSchema.virtual('totals').get(function() {
	let grandTotals = this.contracts.reduce((acc, current) => {

		acc.monday += current.monday;
		acc.tuesday += current.tuesday;
		acc.wednesday += current.wednesday;
		acc.thursday += current.thursday;
		acc.friday += current.friday;
		acc.saturday += current.saturday;
		acc.sunday += current.sunday;
		acc.total += current.total;

	}, { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0, total: 0, collectionCompany: 'all'});

	return grandTotals;
});

const Area = model('area', areaSchema, 'areas');

module.exports = Area;
