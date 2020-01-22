const host = document.location.host;
const baseUrl = `http://${host}/api/`;


async function mapData(mapping) {
	let url = baseUrl + 'mapData?mapping=' + mapping; 
	const request = new Request(url);
	const response = await fetch(request);

	return response.json();
}

async function data(mapping) {
	let url = baseUrl + 'data?mapping=' + mapping;
	const request = new Request(url);
	const response = await fetch(request);

	return response.json();
}

async function amsData(mapping) {
	let url = baseUrl + 'ams';
	const request = new Request(url);
	const response = await fetch(request);

	return response.json();
}


export {
	mapData,
	data,
	amsData
};