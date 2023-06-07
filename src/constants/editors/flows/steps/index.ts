import type { APIEmbedField, Snowflake } from "discord.js";
import type { FlowSchema } from "../../../../database/models/Guild";
import type { FlowEditorComponent } from "../components";
import step1Welcome from "./step1Welcome";
import step2Triggers from "./step2Triggers";
import step3Actions from "./step3Actions";
import step4Details from "./step4Details";

export interface Step {
  title: string;
  description: string;
  skipIfExists?: true;
  fields?(flow: FlowSchema): APIEmbedField[];
  components?(flow: FlowSchema, userId: Snowflake): Array<[FlowEditorComponent, ...FlowEditorComponent[]]>;
  getStatus(flow: FlowSchema): "complete" | "incomplete";
}

export default [step1Welcome, step2Triggers, step3Actions, step4Details];
