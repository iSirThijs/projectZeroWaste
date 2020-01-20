const d3 = require('d3');
const { JSDOM } = require('jsdom');

function createChart(featureCollection) {
	let collectionCompany = 'all';
	let day = 'total';

	let extent = d3.extent(featureCollection.features, (d) => {
	

		
		let averagesKM2 = d.properties.averagesKM2;
		let averageKM2 = averagesKM2.find((average) => average.collectionCompany === collectionCompany);

		
		return averageKM2[day];
	});

	let colorScale = d3.scaleLinear()
		.domain([0, 1, extent[1]])
		.range(['grey', 'green', 'orange', 'red']);

	let color = d => {
		let averagesKM2 = d.properties.averagesKM2;
		let averageKM2 = averagesKM2.find((average) => average.collectionCompany === collectionCompany);
		if(averageKM2[day] > 0) console.log(averageKM2[day]);
		return colorScale(averageKM2[day]);
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