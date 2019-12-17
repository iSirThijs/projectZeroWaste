const bcrypt = require('bcrypt');



module.exports = function(newUser) {
	return new Promise((resolve, reject) => {
		checkLength(newUser, 6)
			.then(newUser => hash(newUser))
			.then(newUser => resolve(newUser))
			.catch(error => reject(error));
	});
};

/**
 * Checks if the length of the password follows the requirements
 * @param {string} password - the password to be checked
 * @param {number} minChar - the minimum amount of characters in the password
 * @param {number} [maxChar] - the maximum amount of characters in the password
 * @returns {boolean|Object} true if the length is right, message if not
 */
async function checkLength(newUser, minChar, maxChar) {
	let password = newUser.get('password');

	if (password.length >= minChar) {
		if(!maxChar) return newUser;
		else if (password.length <= maxChar) return newUser;
		else throw { type: 'silly', data: `Password is to long. The maximum length is ${maxChar} characters`};
	} else throw { type: 'silly', data: `Password is to short. The minimum length is ${minChar} characters`};
}

async function hash(newUser) {
	try {
		let hash = await bcrypt.hash(newUser.get('password'), 10);
		newUser.set('hash', hash);
		newUser.delete('password');
		return newUser;
	} catch (error) {
		throw {type: 'error', data: error};
	}
}