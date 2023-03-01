import { createLogger, transports } from "winston";
import { createFileTransports, globalFormat } from ".";

// if you run the manager and bot in parallel then we need to avoid the log files overlapping as this will crash the bot
const prefix = process.argv.join(" ").endsWith("manager") && !process.env["IS_DOCKER"] ? "manager-" : "";

const databaseLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports(`${prefix}database`, ["debug"]),
    new transports.Console({ level: "info" }),
  ],
});

export default databaseLogger;
