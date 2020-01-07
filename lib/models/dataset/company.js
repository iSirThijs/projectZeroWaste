const { Schema, model } = require('mongoose');

const companySchema = new Schema({
	_id: {type: Number, alias: 'kvkNumber'},
	company_name: String,
});

const Company = model('Company', companySchema, 'companies');

module.exports = Company;