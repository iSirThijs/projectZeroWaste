const d3 = require('d3');
const { JSDOM } = require('jsdom');

function map(featureCollection, queries, mapID) {
	let {day = 'total', collectionCompany = 'all', mapping } = queries;

	let extent = d3.extent(featureCollection.features, (d) => {
		let computations = d.properties.computations;
		let computation = computations.find((comp) => comp.collectionCompany === collectionCompany);

		return computation.averagesKM2[day];
	});

	let colorScale = d3.scaleLinear()
		.domain([0, 1, extent[1]])
		.range(['lightgrey', '#00d2cf', '#005351']);

	let color = d => {
		let computations = d.properties.computations;
		let computation = computations.find((comp) => comp.collectionCompany === collectionCompany);
		return colorScale(computation.averagesKM2[day]);
	};

	const width = 800;
	const height = 600;

	let projection = d3.geoAlbers() 
		.center([4.9, 52.366667])
		.parallels([51.5, 51.49])
		.rotate(120)
		.scale(200000)
		.translate([width / 2, height / 2]);	
		
	const path = d3.geoPath().projection(projection);

	const {document} = (new JSDOM()).window;

	const container = d3.select(document.body).append('div');

	const svg = container.append('svg')
		.attr('id', mapID)
		.attr('data-day', day)
		.attr('data-mapping', mapping)
		// .attr('width', '100%')
		// .attr('height', '90%')
		.attr('viewBox', () => `0, 0, ${width}, ${height}`);
	
		
	const paths = svg.selectAll('path')
		.data(featureCollection.features, d => d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code)
		.enter()
		.append('path')
		.attr('id', d => d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code )
		.attr('stroke', 'whitesmoke')
		.attr('fill', color)
		.attr('d', path);

	return container.html();

}

function categories(data, queries) {
	let { collectionCompany = 'all', day = 'total'} = queries;
	let { computations } = data;

	let computation = computations.find(d => d.collectionCompany === collectionCompany);
	let categories = computation.categories;

	

	let max = d3.max(categories, (d) => d[day]);

	const width = 1000;
	const height = 1000;

	const {document} = (new JSDOM()).window;

	const container = d3.select(document.body).append('div');

	const svg = container.append('svg')
		.attr('id', 'barchart-categories')
		// .attr('width', '100%')
		// .attr('height', '100%')
		.attr('viewBox', () => `0, 0, ${width}, ${height}`);

	categories.sort((b, a) => a[day] - b[day]);


	// X axis
	let x = d3.scaleLinear()
		.domain([0, max])
		.range([ 0, width]);


	// svg.append('g')
	// 	.attr('transform', `translate(0, ${height - 70})` )
	// 	.call(d3.axisBottom(x))
	// 	.selectAll('text')
	// 	.attr('transform', 'translate(-10,0)rotate(-45)')
	// 	.style('text-anchor', 'end');

	// Add Y axis
	let y = d3.scaleBand()
		.range([0, height])
		.domain(categories.map(d => d._id))
		.padding(.5);
		
		
	// svg.append('g')
	// 	.call(d3.axisLeft(y));

	let bars = svg.selectAll('g')
		.data(categories, d => d._id);
		
	let barEnter = bars.enter()
		.append('g')
		.attr('id', d => d._id);

	barEnter.append('text')
		.text(d => d._id)
		.attr('x', 0)
		.attr('y', d => y(d._id));

	barEnter.append('rect')
		.attr('x', 0)
		.attr('y', d => y(d._id) + 10 )
		.attr('width', d => x(d[day]))
		.attr('height', () => y.bandwidth())
		.attr('fill', '#2980B9');

	return container.html();

}

module.exports = {
	map,
	categories
};