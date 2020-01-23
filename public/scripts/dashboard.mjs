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
	
	let daysMap1 = d3.select('#days-map1');
	let daysMap2 = d3.select('#days-map2');
	let mappingFilter = d3.select('#mapping');
	
	let dayButtonsMap1Div = daysMap1.append('div');
	let dayButtonsMap2Div = daysMap2.append('div');
	let mappingButtonsDiv = mappingFilter.append('div');

	dayButtonsMap1Div.selectAll('button')
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

	dayButtonsMap2Div.selectAll('button')
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

	let mappingButtons = mappingFilter.selectAll('.mapping');

	mappingButtons.on('click', async () => {
		const mapping = d3.event.target.value;
		const day1 = d3.select('#map1').attr('data-day');
		updateMap(await data[mapping], {day: day1, mapping, id: '#map1'});
		
		const day2 = d3.select('#map2');
		if(day2._groups[0]) {
			updateMap(await data[mapping], {day: day2.attr('data-day'), mapping, id: '#map2'});
		}
	});

	let dayButtonsMap1 = dayButtonsMap1Div.selectAll('.days');

	dayButtonsMap1.on('click', async () => {
		const mapping = d3.select('#map1').attr('data-mapping');
		const day = d3.event.target.value;
		updateMap(await data[mapping], {day, mapping, id: '#map1'});
		// updateCategories(await categoryData.amsterdam, {day});
	});

	let dayButtonsMap2 = dayButtonsMap2Div.selectAll('.days');

	dayButtonsMap2.on('click', async () => {
		const mapping = d3.select('#map2').attr('data-mapping');
		const day = d3.event.target.value;
		updateMap(await data[mapping], {day, mapping, id: '#map2'});
		// updateCategories(await categoryData.amsterdam, {day});
	});
}



 

