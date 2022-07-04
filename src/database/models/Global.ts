import { getModelForClass, prop } from "@typegoose/typegoose";
import type { DocumentType } from "@typegoose/typegoose";
import { getWeek } from "../../utils/time";

export class GlobalSchema {
  @prop({ type: Number, default: 0 }) counts!: number;
  @prop({ type: Number, default: getWeek }) week!: number;
}

export type GlobalDocument = DocumentType<GlobalSchema>;

export const Global = getModelForClass(GlobalSchema);
