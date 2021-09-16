import { prop, getModelForClass, DocumentType } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";

export class Access {
  @prop({ required: true }) public user!: string;
  @prop({ default: [] })    public servers!: Array<string>;
  @prop({ required: true }) public expires!: Date;
}

export type AccessDocument = DocumentType<Access, BeAnObject>;

export default getModelForClass(Access);