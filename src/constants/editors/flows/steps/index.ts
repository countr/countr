import type { APIEmbedField, Snowflake } from "discord.js";
import type { FlowSchema } from "../../../../database/models/Guild";
import type { FlowEditorComponent } from "../components";
import step1Welcome from "./step1Welcome";
import step2Triggers from "./step2Triggers";
import step3Actions from "./step3Actions";
import step4Details from "./step4Details";

export interface Step {
  components?(flow: FlowSchema, userId: Snowflake): Array<[FlowEditorComponent, ...FlowEditorComponent[]]>;
  description: string;
  fields?(flow: FlowSchema): APIEmbedField[];
  getStatus(flow: FlowSchema): "complete" | "incomplete";
  skipIfExists?: true;
  title: string;
}

export default [step1Welcome, step2Triggers, step3Actions, step4Details];
