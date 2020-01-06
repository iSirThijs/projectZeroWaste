
module.exports = {
	notify,
	error,
	warning,
	info,
	success
};


function notify(level, message) {
	switch (level) {
	case 'error': return error();
	case 'warning': return warning(message);
	case 'info': return info(message);
	case 'success': return success(message);
	default: throw new Error('Please supply a level');
	}
}

function error() {
	let notification = {
		type: 'error',
		content: 'Please try again later or contact the developer if the issue persists'
	};

	return notification;
}

function warning(msg) {
	let notification = {
		type: 'warning',
		content: msg
	};

	return notification;
}

function info(msg) {
	let notification = {
		type: 'info',
		content: msg
	};

	return notification;
}

function success(msg) {
	let notification = {
		type: 'success',
		content: msg
	};

	return notification;
}

