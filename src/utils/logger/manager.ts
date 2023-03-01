import { createLogger, transports } from "winston";
import { createFileTransports, globalFormat } from ".";

const managerLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("manager", ["info", "http"]),
    new transports.Console({ level: "info" }),
  ],
});

export default managerLogger;
