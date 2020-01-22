const d3 = require('d3');
const { JSDOM } = require('jsdom');

function map(featureCollection, queries) {
	let {day = 'total', collectionCompany = 'all' } = queries;

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
		.attr('id', 'map1')
		// .attr('width', '100%')
		// .attr('height', '90%')
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
		// .attr('width', '80%')
		// .attr('height', '80%')
		.attr('viewBox', () => `0, 0, ${width}, ${height}`);

	categories.sort((b, a) => a[day] - b[day]);


	// X axis
	let x = d3.scaleBand()
		.range([0, width])
		.domain(categories.map(d => d._id));

	let group = svg.append('g')
		.attr('transform', 'translate(1000,0)rotate(90)');

	group.append('g')
		.attr('transform', `translate(0, ${height})` )
		.call(d3.axisBottom(x))
		.selectAll('text')
		.attr('transform', 'translate(0,0)rotate(0)')
		.style('text-anchor', 'end');

	// Add Y axis
	let y = d3.scaleLinear()
		.domain([0, max])
		.range([ height, 0]);
		
	group.append('g')
		.call(d3.axisLeft(y));


	group.selectAll('myBar')
		.data(categories)
		.enter()
		.append('rect')
		.attr('x', d => x(d._id))
		.attr('y', d => y(d[day]))
		.attr('width', x.bandwidth())
		.attr('height', d => height - y(d[day]))
		.attr('fill', '#69b3a2');

	return container.html();

}

module.exports = {
	map,
	categories
};