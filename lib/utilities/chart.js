const d3 = require('d3');
const { JSDOM } = require('jsdom');

function createChart(featureCollection, queries) {
	let {day = 'total', collectionCompany = 'all' } = queries;

	let extent = d3.extent(featureCollection.features, (d) => {
		let computations = d.properties.computations;
		let computation = computations.find((comp) => comp.collectionCompany === collectionCompany);

		return computation.averagesKM2[day];
	});

	let colorScale = d3.scaleLinear()
		.domain([0, 1, extent[1]])
		.range(['grey', 'green', 'orange', 'red']);

	let color = d => {
		let computations = d.properties.computations;
		let computation = computations.find((comp) => comp.collectionCompany === collectionCompany);
		return colorScale(computation.averagesKM2[day]);
	};

	const width = 1000;
	const height = 1000;

	let projection = d3.geoAlbers() 
		.center([4.9, 52.366667])
		.parallels([51.5, 51.49])
		.rotate(120)
		.scale(250000)
		.translate([width / 2, height / 2]);	
		
	const path = d3.geoPath().projection(projection);

	const {document} = (new JSDOM()).window;

	const container = d3.select(document.body).append('div');

	const svg = container.append('svg')
		.attr('id', 'ams-chart')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('viewBox', () => `0, 0, ${width}, ${height}`);
	
		
	const paths = svg.selectAll('path')
		.data(featureCollection.features, d => d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code)
		.enter()
		.append('path')
		.attr('id', d => d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code )
		.attr('d', path)
		.attr('stroke', 'whitesmoke')
		.attr('fill', color);

	return container.html();

}

module.exports = {
	createChart
};