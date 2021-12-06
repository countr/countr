import { createLogger, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { dailyRotateFileOptions } from "./";

export const mongooseLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.align(),
    format.printf(({ level, timestamp, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/mongoose-debug.%DATE%.log",
      level: "debug",
      ...dailyRotateFileOptions,
    }),
  ],
});
