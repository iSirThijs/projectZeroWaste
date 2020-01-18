(function () {
	document.querySelectorAll('.no-js').forEach((change) => {
		change.classList.toggle('hidden');
		change.classList.toggle('visible');
	});
	
	document.querySelectorAll('.js').forEach((change) => {
		change.classList.toggle('hidden');
		change.classList.toggle('visible');
	});

})();