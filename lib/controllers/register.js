const express = require('express');
const router = express.Router();

const account = require('../utilities/account.js');
const password = require('../utilities/password.js');

router
	.get('/', (req, res) => res.render('register.ejs'))
	.post('/', registerNewUser );

module.exports = router;

// Handles the post to (from the register form)
async function registerNewUser(req, res) {
	let newUser = req.body;
	
	// check password requirements
	if(!password.checkLength(newUser.password, 6)) console.log('password not right'); // redirect with message
	
	// check existence of userinfo in DB
	if(await account.checkExistence('username', newUser.username)) console.log('username already exists');// redirect with message

	// save to database
	account.register(newUser).then((user) => {
		console.log(user);
	});

}