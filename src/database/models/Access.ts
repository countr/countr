import { DocumentType, getModelForClass, prop } from "@typegoose/typegoose";
import { BeAnObject } from "@typegoose/typegoose/lib/types";
import { WhatIsIt } from "@typegoose/typegoose/lib/internal/constants";

export class Access {
  @prop({ type: String, required: true }) user!: string;
  @prop({ type: [String], default: []}, WhatIsIt.ARRAY) servers!: Array<string>;
  @prop({ type: Date, required: true }) expires!: Date;
}

export type AccessDocument = DocumentType<Access, BeAnObject>;

export default getModelForClass(Access);
