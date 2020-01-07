const { Schema, model } = require('mongoose');

const contractsScheme = new Schema({
	dataset: {type: Schema.Types.ObjectId, ref: 'Dataset'},
	company: {type: Number, ref: 'Company'},
	building: {type: Number, ref: 'Building'},
	day: {
		monday: Number,
		tuesday: Number,
		wednesday: Number,
		thursday: Number,
		friday: Number,
		saturday: Number,
		sunday: Number
	}
});

const Contract = model('Contract', contractsScheme, 'contracts');

module.exports = Contract;

contractsScheme.virtual('week')
	.get(function() {
		let { day } = this;
		let values = Object.values(day);
		return values.reduce((acc, cur) => acc + cur);
	});