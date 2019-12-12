/**
 * Utility functions for passwords
 * @module
 */

/**
 * Checks if the length of the password follows the requirements
 * @param {string} password - the password to be checked
 * @param {number} minChar - the minimum amount of characters in the password
 * @param {number} [maxChar] - the maximum amount of characters in the password
 * @returns {boolean} true if the length is right, false if not
 */

function checkLength(password, minChar, maxChar) {
	if (password.length > minChar) {
		if(!maxChar) return true;
		else if (password.length < maxChar) return true;
		else return false;
	} else return false;
}

module.exports = {
	checkLength
}