import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { dailyRotateFileOptions } from "./";

export const discordLogger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.align(),
    format.printf(({ level, timestamp, message }) => `${timestamp} ${level}: ${message}`),
  ),
  transports: [
    new DailyRotateFile({
      filename: "logs/discord-info.%DATE%",
      level: "info",
      ...dailyRotateFileOptions,
    }),
    new DailyRotateFile({
      filename: "logs/discord-warn.%DATE%",
      level: "warn",
      ...dailyRotateFileOptions,
    }),
    new DailyRotateFile({
      filename: "logs/discord-error.%DATE%",
      level: "error",
      ...dailyRotateFileOptions,
    }),
    new DailyRotateFile({
      filename: "logs/discord-debug.%DATE%",
      level: "debug",
      ...dailyRotateFileOptions,
    }),
    new transports.Console({
      level: "info",
    }),
  ],
});
