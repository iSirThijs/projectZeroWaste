
// controllers
const area = require('#controllers/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Charts Data');
const amsAPI = require('#utilities/amsterdam_api.js');



async function getAMSmapdata(queries) {
	let { mapping } = queries;

	// get featureCollection with right mapping
	let { data: featureCollection } = await amsAPI.getFeatureCollection(mapping);

	// get data for mapping
	let mappingData = await area.get(mapping);


	let data = featureCollection.features.map((feature) => {
		let datum = mappingData.find((datum) => {
			if(feature.properties.Buurt_code && datum.code === feature.properties.Buurt_code) return true;
			else if(feature.properties.Buurtcombinatie_code && datum.code === feature.properties.Buurtcombinatie_code) return true;
			else if(feature.properties.Stadsdeel_code && datum.code === feature.properties.Stadsdeel_code) return true;
			else return false;
		});

		let totals = getGrandTotals(datum.contracts);
		datum.contracts.push(totals);

		let averagesKM2 = getAveragesKM2(datum.contracts, datum.m2);
		datum.averagesKM2 = averagesKM2;

		feature.properties.contracts = datum.contracts;
		feature.properties.averagesKM2 = datum.averagesKM2;

		return feature;

	});

	featureCollection.features = data;

	return featureCollection;

}

function getGrandTotals(contracts){
	return contracts.reduce((acc, current) => {

		acc.monday += current.monday;
		acc.tuesday += current.tuesday;
		acc.wednesday += current.wednesday;
		acc.thursday += current.thursday;
		acc.friday += current.friday;
		acc.saturday += current.saturday;
		acc.sunday += current.sunday;
		acc.total += current.total;

		return acc;

	}, { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0, total: 0, collectionCompany: 'all'});
}

function getAveragesKM2(contracts, m2){
	return contracts.map((contract) =>{ 
		let { monday, tuesday, wednesday, thursday, friday, saturday, sunday, total } = contract;

		let averagesM2 = {
			monday: monday / (m2 / 1000000) || 0,
			tuesday: tuesday / (m2 / 1000000) || 0,
			wednesday: wednesday / (m2 / 1000000) || 0,
			thursday: thursday / (m2 / 1000000) || 0,
			friday: friday / (m2 / 1000000) || 0,
			saturday: saturday / (m2 / 1000000) || 0,
			sunday: sunday / (m2 / 1000000) || 0,
			total: total / (m2 / 1000000) || 0,
			collectionCompany: contract.collectionCompany
		};

		return averagesM2;
	});
}

module.exports = {
	amsMapData: getAMSmapdata
};
