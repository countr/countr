import { inspect } from "util";
import mongoose from "mongoose";
import config from "../config";
import databaseLogger from "../utils/logger/database";

mongoose.set("debug", (collectionName, method, query: string, doc: string) => databaseLogger.debug(JSON.stringify({ collectionName, method, query, doc })));

export const connection = mongoose.connect(config.databaseUri);

export * from "./access";
export * from "./global";
export * from "./guild";

connection
  .then(() => databaseLogger.info("Connected to database"))
  .catch((err: unknown) => databaseLogger.error(`Error when connecting to database: ${inspect(err)}`));
