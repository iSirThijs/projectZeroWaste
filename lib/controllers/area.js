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
					let { name, type, code, geometry } = newArea;

					document.name = name;
					document.type = type;
					document.code = code;
					document.geometry = geometry;

				}
			})
			.then((document) => resolve(document))
			.catch(error => {
				logger.error(error);
				reject({type: 'error', error});
			});
	});
}


module.exports = {
	save
}