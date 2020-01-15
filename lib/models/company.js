const { Schema, model } = require('mongoose');

const companySchema = new Schema({
	name: { type: String, required: [true, 'A name must be given to the company']},
	altNames: [String],
	collectionCompany: [{type: Schema.Types.ObjectId, ref: 'Job', required: [true, 'Need this if to remove a dataset']}],
	kvk: {type: Number, default: undefined }
});

const Company = model('Company', companySchema, 'companies');

module.exports = Company;