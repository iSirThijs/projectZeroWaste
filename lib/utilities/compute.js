
const area = require('#controllers/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Compute');


function totals(loadedJob) {

	logger.debug(`Computing totals for dataset ${loadedJob.dataset.collectionCompany}`);

	area.totals.buurt(loadedJob._id)
		// .then((buurten) => area.totals.wijk(loadedJob._id))
		.catch(error => logger.error(error));
	//  -> stadsdeel totaal
	//   -> ams totaal


}

// function totalBuurt(datasetID){


// 	return Area.find()
// 		.where('type').equals('buurt')
// 		.then((buurten) => {
			
// 			let updatedBuurt = buurten.map((buurt) => {
// 				return aggregateBuurt(buurt.code, datasetID)
// 					.then((aggregation) => {
// 						logger.debug('%o', aggregation);
// 						aggregation.collectionCompany = datasetID;
// 						buurt.contracts.push(aggregation);
// 						return buurt.save();
// 					});
// 			});

// 			return Promise.all(updatedBuurt);
// 		})
// 		.catch(error => logger.error(error));
// }



// function totalWijk(datasetID){

// 	Area.find()
// 		.where('type').equals('wijk')
// 		.then((wijken) => {
			
// 		})
	
// }




module.exports = {
	totals
};