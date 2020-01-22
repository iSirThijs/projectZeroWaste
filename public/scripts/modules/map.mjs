export function updateMap(data, {day, mapping, collectionCompany = 'all'}) {

	let extent = d3.extent(data.features, (d) => {
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


	let svg = d3.select('#map1')
		.attr('data-day', day)
		.attr('data-mapping', mapping);

	// data join
	let paths = svg.selectAll('path')
		.data(data.features, function(d) {
			if(d) return d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code;
			else  return d3.select(this).attr('id');
		});

	// Exit
	paths.exit().remove();

	// Update 
	paths.attr('d', path).attr('fill', color);

	// Enter
	paths.enter()
		.append('path')
		.attr('id', d => d.properties.Buurt_code || d.properties.Buurtcombinatie_code || d.properties.Stadsdeel_code )
		.attr('stroke', 'whitesmoke')
		.attr('fill', color)
		.attr('d', path);

}