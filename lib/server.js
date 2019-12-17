require('dotenv').config();
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const session = require('express-session');

// Controllers
const register = require('./controllers/register.js');

server
	.use('/public', express.static('../public'))
	.use(bodyParser.urlencoded({ extended: true}))
	.use(session({
		resave: false, // checked session docs, false is best option(for now)
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET
	}))
	.set('view engine', 'ejs')
	.set('views', './lib/views' )
	.use(setResLocals)
	.use('/register', register)
	.listen(process.env.PORT || 8000);


function setResLocals(req, res, next){
	res.locals.notification = undefined;
	next();
}