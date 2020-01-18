const d3 = require('d3');
const { JSDOM } = require('jsdom');

function createChart(data, featureCollection) {

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
		.data(featureCollection.features)
		.enter()
		.append('path')
		// .attr('id', (d) => d.properties)
		.attr('d', path)
		.attr('stroke', 'whitesmoke')
		.attr('fill', 'grey');

	return container.html();

}

module.exports = {
	createChart
};