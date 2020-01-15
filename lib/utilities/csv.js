const fs = require('fs').promises;
const d3 = require('d3');

const logger = require('#utilities/logger.js').getLogger('CSV');

function loadCSV(path) {
	return new Promise((resolve, reject) => {

		logger.debug(`Loading CSV from ${path}`);

		loadFromFile(path)
			.then((dataString) => parseString(dataString))
			.then((data) => {
				logger.debug('data loaded from CSV file');
				resolve(data);
			})
			.catch(error => {
				logger.error(error);
				reject({type: 'error', error });
			});
	});
}

// loads the file in buffer and converts it to string
function loadFromFile(path){
	return new Promise((resolve, reject) => {
		fs.readFile(path)
			.then(dataBuffer => dataBuffer.toString())
			.then(dataString => resolve(dataString))
			.catch(error => reject(error));
	});
}

// uses d3 to parse the string to an object
function parseString(dataString) {
	const ssv = d3.dsvFormat(';');
	return ssv.parse(dataString);
}

module.exports = {
	loadCSV,
	parseString,
	loadFromFile
};
