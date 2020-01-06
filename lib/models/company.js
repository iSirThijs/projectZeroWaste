const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
	buildingNumber: Number,
	streetName: String,
	number: Number,
	suffix: String,
	postalCode: String,
	mainBuilding: Boolean,
	category: String,
	sbiMain: String,
	sbiCodes: Array,
	city: String,
	ggw: String,
	codes: Array,
	contracts: {
		monday: Number,
		tuesday: Number,
		wednesday: Number,
		thursday: Number,
		friday: Number,
		saturday: Number,
		sunday: Number,
	}
});

const companySchema = new Schema({
	kvk_number: Number,
	company_name: String,
	buildings: [addressSchema]
});

const Company = model('Company', companySchema, 'companies');

module.exports = Company;