// Modules
const winston = require('winston');
const { transports, format, loggers } = winston;
const { combine, timestamp, label, printf, splat, errors, colorize } = format;
require('winston-daily-rotate-file');

const logMessage = printf(({level, timestamp, label, message, stack}) => {
	return `[${level}] ${timestamp} <${label}>: ${message} ${stack ? `- ${stack}` : ''}`;
});


// default file transport
let transport = [];

// Console output on development
if (process.env.NODE_ENV !== 'production') {
	transport.push(new transports.Console({
		level: process.env.LOG_LEVEL,
		format: combine(
			colorize(),
			logMessage
		)
	}));
}

// This exports the logger
module.exports.getLogger = function (catLabel) {
	if (!loggers.has(catLabel)) {
		loggers.add(catLabel, {
			transports: transport,
			format: combine(
				label({ label: catLabel, message: false }),
				timestamp({format: '[at] HH:mm:ss:SSS'}),
				splat(),
				errors({stack: true}),
			)
		});
	}
	return loggers.get(catLabel);
};