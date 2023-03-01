import { createLogger } from "winston";
import { createFileTransports, globalFormat } from ".";

const countingLogger = createLogger({
  format: globalFormat,
  transports: [...createFileTransports("counting", ["info", "debug"])],
});

export default countingLogger;
