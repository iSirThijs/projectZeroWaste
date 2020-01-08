
// Utilities
const validate = require('#utilities/data_validation.js');

// Models
const Company = require('#models/company.js');

module.exports.extractCompany = function(datum){
	return new Promise((resolve, reject) => {
		let { kvknummer: kvk = undefined, bedijfsnaam: name } = datum;

		validate.exists('Company', { name, kvk }, ['name'])
			.then((documents) => {
				resolve();
			})
			.catch(error => {
				reject({type: 'error', error});
			});


	});
};


// vestegingsnummer;kvknummer;hoofdkantoor;bedrijfsnaam;straat;huisnummer;toevoeging;postcode;sbi_hoofdcode;sbi_code;ma;di;woe;do;vr;zat;zo;stadsdeel;buurt;wijk;ggw