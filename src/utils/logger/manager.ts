import { createFileTransports, globalFormat } from ".";
import { createLogger, transports } from "winston";

export const managerLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("manager", ["info", "http"]),
    new transports.Console({ level: "info" }),
  ],
});
