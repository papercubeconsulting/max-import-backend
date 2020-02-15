// Setup Winston Logger

const winston = require('winston');
const config = require('config');
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
      // new winston.transports.File({
      //   filename: 'logfile.log',
      //   level: 'error'
      // }),
      // new winston.transports.File({
      //   filename: 'combined.log'
      // }),
    ],
  });

  winston.exceptions.handle(
    // new winston.transports.File({
    //   filename: 'uncaughtExceptions.log',
    // }),
    new winston.transports.Console({
      colorize: true,
      prettyPrint: true,
    }),
  );

  winston.info('3/4 Setup loggers');
};
