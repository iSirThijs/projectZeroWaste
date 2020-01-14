const { Schema, model } = require('mongoose');

const companySchema = new Schema({
	name: String,
	kvk: Number
});

const Company = model('Company', companySchema, 'companies');

module.exports = Company;