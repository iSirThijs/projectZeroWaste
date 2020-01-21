
const Area = require('#models/area.js');

// utilities
const logger = require('#utilities/logger.js').getLogger('Compute');

function sumDays({wijk = undefined, stadsdeel = undefined, amsterdam = false, datasetID}) {

	let matchFilter;

	if(!wijk && !stadsdeel && !amsterdam) throw new Error('Need a mapping');

	if(wijk) matchFilter = { type: 'buurten', parent: wijk.code };
	if(stadsdeel) matchFilter = { type: 'wijken', parent: stadsdeel.code };
	if(amsterdam) matchFilter = { type: 'stadsdelen', parent: 'Amsterdam'};

	return Area.aggregate()
		.match(matchFilter)
		.unwind({ path: '$computations'})
		.match({ 'computations.collectionCompany': datasetID })
		.group({
			_id: null,
			monday: { '$sum': '$computations.sum.monday'},
			tuesday: { '$sum': '$computations.sum.tuesday'},
			wednesday: { '$sum': '$computations.sum.wednesday'},
			thursday: { '$sum': '$computations.sum.thursday'},
			friday: { '$sum': '$computations.sum.friday'},
			saturday: { '$sum': '$computations.sum.saturday'},
			sunday: { '$sum': '$computations.sum.sunday'},
			total: { '$sum': '$computations.sum.total'}
		})
		.project({
			_id: false
		}).then((totals) => {
			if(!totals[0]) return { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0, total: 0 };
			else return totals[0];
		}).catch(error => logger.error(error));
}


function sumCategories({wijk = undefined, stadsdeel = undefined, amsterdam = false, datasetID}) {

	let matchFilter;

	if(!wijk && !stadsdeel && !amsterdam) throw new Error('Need a mapping');

	if(wijk) matchFilter = { type: 'buurten', parent: wijk.code };
	if(stadsdeel) matchFilter = { type: 'wijken', parent: stadsdeel.code };
	if(amsterdam) matchFilter = { type: 'stadsdelen', parent: 'Amsterdam'};

	return Area.aggregate()
		.match(matchFilter)
		.unwind({ path: '$computations'})
		.match({ 'computations.collectionCompany': datasetID })
		.unwind({ path: '$computations.categories'})
		.group({
			_id: '$computations.categories._id',
			monday: { '$sum': '$computations.categories.monday'},
			tuesday: { '$sum': '$computations.categories.tuesday'},
			wednesday: { '$sum': '$computations.categories.wednesday'},
			thursday: { '$sum': '$computations.categories.thursday'},
			friday: { '$sum': '$computations.categories.friday'},
			saturday: { '$sum': '$computations.categories.saturday'},
			sunday: { '$sum': '$computations.categories.sunday'},
			total: { '$sum': '$computations.categories.total'}
		})
		.then((totals) => totals)
		.catch(error => logger.error(error));
}


function km2(contract, m2){
	let { monday, tuesday, wednesday, thursday, friday, saturday, sunday, total } = contract;

	let averagesM2 = {
		monday: monday / (m2 / 1000000) || 0,
		tuesday: tuesday / (m2 / 1000000) || 0,
		wednesday: wednesday / (m2 / 1000000) || 0,
		thursday: thursday / (m2 / 1000000) || 0,
		friday: friday / (m2 / 1000000) || 0,
		saturday: saturday / (m2 / 1000000) || 0,
		sunday: sunday / (m2 / 1000000) || 0,
		total: total / (m2 / 1000000) || 0
	};

	return averagesM2;
}

module.exports = {
	sum: {days: sumDays, categories: sumCategories },
	averages: { km2: km2}
};