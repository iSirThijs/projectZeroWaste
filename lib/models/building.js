const { Schema, model } = require('mongoose');

const addressSchema = new Schema({
	company: {type: Schema.Types.ObjectId, ref: 'Company', required: true},
	collectionCompany: {type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true},
	street: {type: String, required: true},
	number: {type: Number, required: true },
	suffix: {type: String, default: undefined},
	postalCode: {type: String, required: true },
	category: { type: String, required: true, enum: [ 'Productie en winning', 'Handel en verkoop', 'Sociale dienstverlening', 'Financiële dienstverlening', 'Geen Categorie'  ] },
	sbiMain: { type: String, index: true },
	sbiCode: { type: Number, index: true },
	stadsdeel: String,
	buurt: { type: String, index: true },
	ggw: String,
	contract: {
		monday: Number,
		tuesday: Number,
		wednesday: Number,
		thursday: Number,
		friday: Number,
		saturday: Number,
		sunday: Number,
		total: Number
	}
});

const Building = model('Building', addressSchema, 'buildings');

module.exports = Building;
