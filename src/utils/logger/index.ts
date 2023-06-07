import { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const globalFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.align(),
  format.printf(({ level, timestamp, message }) => `${String(timestamp)} ${level}: ${String(message)}`),
);

export function createFileTransports(name: string, levels: string[]): DailyRotateFile[] {
  return levels.map(level => new DailyRotateFile({
    filename: `logs/${name}-${level}.%DATE%`,
    level,
    maxSize: "25m",
    maxFiles: "14d",
    zippedArchive: true,
    extension: ".log",
  }));
}
