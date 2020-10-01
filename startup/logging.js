// Setup Winston Logger
const winston = require('winston');
require('express-async-errors');

const { combine, timestamp, printf, label } = winston.format;

const myFormat = printf(info => {
  if (info instanceof Error) {
    return `${info.timestamp} ${info.level} : ${info.message} ${info.stack}`;
  }
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

module.exports = () => {
  winston.configure({
    level: 'info',
    format: combine(
      winston.format.colorize(),
      winston.format.splat(),
      label({
        label: 'Logging...',
      }),
      timestamp(),
      myFormat,
    ),
    defaultMeta: {
      service: 'user-service',
    },
    transports: [
      new winston.transports.Console({
        level: 'silly',
      }),
    ],
  });

  winston.exceptions.handle(
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
    }),
  );

  winston.info('3/4 Setup loggers');
};
