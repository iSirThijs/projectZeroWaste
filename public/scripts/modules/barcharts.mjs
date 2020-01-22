export function updateCategories(data, {day, mapping, collectionCompany = 'all'}) {

	let computation = data.computations.find(d => d.collectionCompany === collectionCompany);
	let categories = computation.categories;

	let max = d3.max(categories, (d) => d[day]);

	const width = 1000;
	const height = 1000;

	categories.sort((b, a) => a[day] - b[day]);

	let t = d3.transition()
		.duration(700)
		.ease(d3.easePoly);

	// X axis
	let x = d3.scaleLinear()
		.domain([0, max])
		.range([ 0, width]);

	// Add Y axis
	let y = d3.scaleBand()
		.range([0, height])
		.domain(categories.map(d => d._id))
		.padding(.5);

	const svg = d3.select('#barchart-categories');
		
	let bars = svg.selectAll('g')
		.data(categories, function(d) {
			if(d) return d._id;
			else  return d3.select(this).attr('id');
		});

	// exit
	bars.exit().remove();

	// update
	bars.selectAll('rect')
		.transition(t)
		.attr('y', function(d) {
			if(d) return y(d._id) + 10;
			else  return y(d3.select(this).attr('id')) + 10;
		})
		.attr('width', function(d) {
			if(d) return x(d[day]);
			else {
				let id = d3.select(this).attr('id');
				let tempData = data.get(id);
				return x(tempData[day]);
			};
		})
		.attr('height', () => y.bandwidth());

	bars.selectAll('text')
		.transition(t)
		.attr('y', d => y(d._id));

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






}