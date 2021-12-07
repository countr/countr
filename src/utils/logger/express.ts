
import DailyRotateFile from "winston-daily-rotate-file";
import { dailyRotateFileOptions } from "./";
import expressWinston from "express-winston";
import { format } from "winston";

export const expressLogger = expressWinston.logger({
  format: format.json(),
  transports: [
    new DailyRotateFile({
      filename: "logs/express-info.%DATE%",
      level: "info",
      ...dailyRotateFileOptions,
    }),
  ],
});
