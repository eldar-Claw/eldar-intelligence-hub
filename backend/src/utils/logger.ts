import winston from 'winston';
import { db } from '../db/client';
import { logs } from '../db/schema';

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export const logger = {
  info(message: string, details?: string) {
    winstonLogger.info(message);
    try {
      db.insert(logs).values({
        level: 'info',
        message,
        details: details || null,
        createdAt: new Date().toISOString(),
      }).run();
    } catch (e) {
      // Ignore DB errors in logger
    }
  },

  warn(message: string, details?: string) {
    winstonLogger.warn(message);
    try {
      db.insert(logs).values({
        level: 'warn',
        message,
        details: details || null,
        createdAt: new Date().toISOString(),
      }).run();
    } catch (e) {
      // Ignore DB errors in logger
    }
  },

  error(message: string, details?: string) {
    winstonLogger.error(message);
    try {
      db.insert(logs).values({
        level: 'error',
        message,
        details: details || null,
        createdAt: new Date().toISOString(),
      }).run();
    } catch (e) {
      // Ignore DB errors in logger
    }
  },
};
