const { Schema, model } = require('mongoose');

const companySchema = new Schema({
	_id: Schema.Types.ObjectId,
	name: String,
	kvk: Number
});

const Company = model('Company', companySchema, 'companies');

module.exports = Company;