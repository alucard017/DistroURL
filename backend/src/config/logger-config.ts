import { createLogger, transports, format } from "winston";
import { stringify } from "querystring";

const { combine, timestamp, printf, errors } = format;

const customFormat = printf(({ level, message, timestamp, error, ...meta }) => {
  const logMessage = {
    timestamp,
    level,
    message,
    error: error ? error : undefined,
    meta,
  };
  return JSON.stringify(logMessage);
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "combined.log" }),
  ],
});

export default logger;
