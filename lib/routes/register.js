const express = require('express');
const router = express.Router();

const account = require('#controllers/account.js');
const password = require('#utilities/password.js');
const log = require('#utilities/logger.js').getLogger('register');

router
	.get('/', (req, res) => res.render('account/register.ejs'))
	.post('/', registerNewUser );

module.exports = router;

// Handles the post to (from the register form)
function registerNewUser(req, res) {
	let newUser = new Map(Object.entries(req.body));
	newUser.delete('signup');

	account.checkExistence(newUser)
		.then(newUser => password(newUser))
		.then(newUser => account.register(newUser))
		.then(user => {
			log.log('silly', 'User saved successfully');
			req.session.username = user.username;
			req.session.id = user._id;
			res.redirect('/');
		})
		.catch((error) => {
			log.log(error.type, error.data);

			res.locals.notification = {
				type: 'warning',
				content: error.data
			};
			res.render('account/register.ejs');
		});

}