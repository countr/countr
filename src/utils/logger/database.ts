import { createFileTransports, globalFormat } from ".";
import { createLogger, transports } from "winston";

// if you run the manager and bot in parallel then we need to avoid the log files overlapping as this will crash the bot
const prefix = process.argv.join(" ").endsWith("manager") && !process.env["IS_DOCKER"] ? "manager-" : "";

export const databaseLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports(`${prefix}database`, ["info", "debug"]),
    new transports.Console({ level: "info" }),
  ],
});
