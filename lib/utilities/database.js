const logger = require('#utilities/logger.js').getLogger('Database');

// MongoDB database
const { connect, connection } = require('mongoose');
const server = process.env.MONGODB;
const options = {
	dbName: process.env.DB_NAME,
	useNewUrlParser: true,
	useUnifiedTopology: true
};
const db = connection;

db
	.on('connecting', () => logger.debug('Connecting to DB'))
	.on('open', () => logger.debug('DB connection open'))
	.on('disconnecting', () => logger.debug('Closing DB connections'))
	.on('disconnected', () => logger.debug('DB connection is closed'))
	.on('reconnected', () => logger.debug('reconnected to DB'))
	.on('reconnectFailed', () => logger.debug('reconnection failed')) // restart the server// ofline error mode?
	.on('error', error => logger.error(error));

connect(server, options);