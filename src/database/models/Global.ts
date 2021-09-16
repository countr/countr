import { prop, getModelForClass, DocumentType } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { getWeek } from "../../utils/time";

export class Global {
  @prop({ default: 0 })       public counts!: number;
  @prop({ default: getWeek }) public week!: number;
}

export type GlobalDocument = DocumentType<Global, BeAnObject>;

export default getModelForClass(Global);