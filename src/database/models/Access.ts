import { prop, getModelForClass } from "@typegoose/typegoose";

export class Access {
  @prop({ required: true }) public user!: string;
  @prop({ default: [] })    public servers!: Array<string>;
  @prop({ required: true }) public expires!: Date;
}

export default getModelForClass(Access);