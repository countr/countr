import { createLogger, transports } from "winston";
import { createFileTransports, globalFormat } from ".";

const discordLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("discord", ["info", "debug"]),
    new transports.Console({ level: "info" }),
  ],
});

export default discordLogger;
