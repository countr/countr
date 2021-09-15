import { prop, getModelForClass } from "@typegoose/typegoose";
import { getWeek } from "../../utils/time";

export class Global {
  @prop({ default: 0 })       public counts!: number;
  @prop({ default: getWeek }) public week!: number;
}

export default getModelForClass(Global);