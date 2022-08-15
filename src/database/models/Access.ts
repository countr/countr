// should be the same as this file from the countr/access-manager repository:
// https://github.com/countr/access-manager/blob/main/src/database/models/Access.ts

import { getModelForClass, prop } from "@typegoose/typegoose";
import type { DocumentType } from "@typegoose/typegoose";
import { PropType } from "@typegoose/typegoose/lib/internal/constants";
import type { Snowflake } from "discord.js";

export class AccessSchema {
  @prop({ type: String, required: true }) userId!: string;
  @prop({ type: [String], default: []}, PropType.ARRAY) guildIds!: Snowflake[];
  @prop({ type: Date, required: true }) expires!: Date;
}

export type AccessDocument = DocumentType<AccessSchema>;

export const Access = getModelForClass(AccessSchema);
