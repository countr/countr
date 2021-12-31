import { Component } from "./components";
import { EmbedFieldData } from "discord.js";
import { Flow } from "../../database/models/Guild";

export interface Step {
  title: string;
  description(flow: Flow): string;
  fields?(flow: Flow): Array<EmbedFieldData>;
  components?(flow: Flow): Array<Array<Component>>; // action row, components
  getStatus(flow: Flow): "complete" | "incomplete";
  skipIfExists?: boolean;
}
