import winston from "winston";
import serverConfig from "../config/server-config";
const { combine, timestamp, printf, colorize, align } = winston.format;
import DailyRotateFile from "winston-daily-rotate-file";

const logger = winston.createLogger({
  level: serverConfig.LOG_LEVEL || "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    align(),
    printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        align(),
        printf(
          ({ timestamp, level, message }) =>
            `[${timestamp}] ${level}: ${message}`
        )
      ),
    }),
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

export default logger;
