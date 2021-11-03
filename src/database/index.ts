import config from "../config";
import mongoose from "mongoose";

export const connection = mongoose.connect(config.databaseUri);
