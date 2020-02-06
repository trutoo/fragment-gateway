const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const { AzureLogger } = require('winston-azuretable');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require('./config');

// No logs
const printFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  exitOnError: false,
  format: combine(label({ label: 'fragment-gateway' }), timestamp(), printFormat),
});

if (process.env.AZURE_STORAGE_ACCOUNT && process.env.NODE_ENV === 'production') {
  logger.add(
    new AzureLogger({
      level: process.env.LOG_LEVEL || 'warn',
      tableName: process.env.AZURE_STORAGE_TABLE || 'fragmentgateway',
    }),
  );
}

if (process.env.NODE_ENV !== 'test') {
  logger.add(
    new DailyRotateFile({
      dirname: config.logs,
      filename: 'error.%DATE%.log',
      level: 'error',
      maxSize: 1024 * 10,
    }),
  );
  logger.add(
    new DailyRotateFile({
      dirname: config.logs,
      filename: 'combined.%DATE%.log',
      maxSize: 1024 * 10,
    }),
  );
}

logger.add(
  new transports.Console({
    silent: process.env.NODE_ENV == 'test',
  }),
);

module.exports = logger;
