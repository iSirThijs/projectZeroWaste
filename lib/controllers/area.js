const logger = require('#utilities/database.js').loggerName('Controller - Areas');

// models
const Area = require('#models/area.js');

// save 
function save(newArea) {
	return new Promise((resolve, reject) => {

		Area.findOne(newArea)
			.then((document) => {
				if(!document) {
					let model = new Area(newArea);
					return model.save();
				}
				else {
					let { name, type, code, m2 } = newArea;

					document.name = name;
					document.type = type;
					document.code = code;
					document.m2 = m2;

				}
			})
			.then((document) => resolve(document))
			.catch(error => {
				console.log(error)
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}


function get(mapping) {
	return Area.find().where('type').equals(mapping);
}

module.exports = {
	save,
	get
};