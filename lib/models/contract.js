const { Schema, model } = require('mongoose');

const contractsScheme = new Schema({
	_id: Schema.Types.ObjectId,
	dataset: {type: Schema.Types.ObjectId, ref: 'Dataset'},
	company: {type: Schema.Types.ObjectId, ref: 'Company'},
	building: {type: Schema.Types.ObjectId, ref: 'Building'},
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