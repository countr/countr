import mongoose from "mongoose";
import { getWeek } from "../utils/time";

interface Global {
  counts: number;
  week: number;
}

const globalSchema = new mongoose.Schema<Global>({
  counts: { type: Number, default: 0 },
  week: { type: Number, default: getWeek }
});

const Global = mongoose.model<Global>("Global", globalSchema);

export const get = async (): Promise<Global> => (await Global.findOne()) || new Global();