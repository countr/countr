import { createFileTransports, globalFormat } from "./";
import { createLogger, transports } from "winston";

export const commandsLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("commands", ["debug"]),
    new transports.Console({ level: "info" }),
  ],
});
