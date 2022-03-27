import Global, { GlobalDocument } from "./models/Global";

export const get = async (): Promise<GlobalDocument> => await Global.findOne() || new Global();
