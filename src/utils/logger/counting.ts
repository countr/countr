import { createFileTransports, globalFormat } from "./";
import { createLogger } from "winston";

export const countingLogger = createLogger({
  format: globalFormat,
  transports: [
    ...createFileTransports("counting", ["info", "debug"])
  ]
});
