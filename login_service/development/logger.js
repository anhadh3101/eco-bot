import winston from 'winston';
import path from 'path';

// Configure winston logger for information logging.
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} - ${level}: ${message}`;
    })
    ),
    transports: [
    new winston.transports.File({
        filename: path.join(process.cwd(), 'development/info.log'), // Log info messages here
        level: 'info',
    }),
    new winston.transports.File({
        filename: path.join(process.cwd(), 'development/error.log'), // Log error messages here
        level: 'error',
    }),
    ],
});

// Function to log error messages
export const logError = (error) => {
    logger.error(error.message);
};

// Function to log informational messages
export const logInfo = (message) => {
    logger.info(message);
};
