import { getModelForClass, prop } from "@typegoose/typegoose";
import type { DocumentType } from "@typegoose/typegoose";
import type { Snowflake } from "discord.js";
import { WhatIsIt } from "@typegoose/typegoose/lib/internal/constants";

export class AccessSchema {
  @prop({ type: String, required: true }) user!: string;
  @prop({ type: [String], default: []}, WhatIsIt.ARRAY) servers!: Snowflake[];
  @prop({ type: Date, required: true }) expires!: Date;
}

export type AccessDocument = DocumentType<AccessSchema>;

export const Access = getModelForClass(AccessSchema);
