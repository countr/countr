import mongoose from "mongoose";
import config from "../config";

import * as Guilds from "./guilds";
import * as Global from "./global";
import * as Access from "./access";

export const guilds = Guilds;
export const global = Global;
export const access = Access;

export const connection = mongoose.connect(config.database_uri);