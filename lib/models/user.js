const { Schema, model } = require('mongoose');

const userSchema = new Schema({
	username: String,
	email: String,
	hash: String
});

const User = model('User', userSchema, 'users');

module.exports = User;