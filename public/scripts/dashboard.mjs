// map update and listeners
import { updateMap } from './modules/map.mjs';
// import { updateCategories } from './modules/barcharts.mjs';
import * as api from './modules/api.mjs';

createInteractiveMap();

function createInteractiveMap() {
	// create the buttons and listeners for change
	const data = {
		stadsdelen: api.mapData('stadsdelen'),
		wijken: api.mapData('wijken'),
		buurten: api.mapData('buurten'),
	};

	const categoryData = {
		amsterdam: api.amsData()
	};

	let dayButtonsData = [
		['Totaal', 'total'], 
		['Ma', 'monday'], 
		['Di', 'tuesday'], 
		['Wo', 'wednesday'], 
		['Do', 'thursday'],
		['Vr', 'friday'], 
		['Za', 'saturday'], 
		['Zo', 'sunday']
	];
	let mappingButtonsData = ['Stadsdelen', 'Wijken', 'Buurten'];
	
	let mapfilters = d3.select('#map-filters');
	
	let dayButtonsDiv = mapfilters.append('div');
	let mappingButtonsDiv = mapfilters.append('div');

	dayButtonsDiv.selectAll('button')
		.data(dayButtonsData)
		.enter()
		.append('button')
		.text((d) => d[0])	
		.attr('type', 'button')
		.attr('class', 'buttons')
		.attr('class', 'days')
		.attr('value', d => d[1])
		.attr('type', 'button')
		.attr('name', d => d[1]);

	mappingButtonsDiv.selectAll('button')
		.data(mappingButtonsData)
		.enter()
		.append('button')
		.text((d) => d)	
		.attr('type', 'button')
		.attr('class', 'buttons')
		.attr('class', 'mapping')
		.attr('value', d => d.toLowerCase())
		.attr('type', 'button')
		.attr('name', d => d.toLowerCase());

	let mappingButtons = mapfilters.selectAll('.mapping');

	mappingButtons.on('click', async () => {
		const day = d3.select('#map1').attr('data-day');
		const mapping = d3.event.target.value;
		history.pushState('', '', `context?mapping=${mapping}&day=${day}`);
		updateMap(await data[mapping], {day, mapping});
	});

	let dayButtons = mapfilters.selectAll('.days');

	dayButtons.on('click', async () => {
		const mapping = d3.select('#map1').attr('data-mapping');
		const day = d3.event.target.value;
		history.pushState('', '', `context?mapping=${mapping}&day=${day}`);
		updateMap(await data[mapping], {day, mapping});
		// updateCategories(await categoryData.amsterdam, {day});
	});
}



 

