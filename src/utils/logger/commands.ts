import { createLogger, transports } from "winston";
import { createFileTransports, globalFormat } from ".";

const commandsLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("commands", ["debug"]),
    new transports.Console({ level: "info" }),
  ],
});

export default commandsLogger;
