import Global, { Global as GlobalModel } from "./models/Global";

export const get = async (): Promise<GlobalModel> => await Global.findOne() || new Global();
