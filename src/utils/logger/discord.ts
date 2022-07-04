import { createFileTransports, globalFormat } from "./";
import { createLogger, transports } from "winston";

export const discordLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("discord", ["info", "warn", "debug"]),
    new transports.Console({ level: "info" }),
  ],
});
