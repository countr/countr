import { EmbedFieldData } from "discord.js";
import { Flow } from "../../database/models/Guild";
import { Component } from "./components";

export interface Step {
  title: string;
  description(flow: Flow): string;
  fields?(flow: Flow): Array<EmbedFieldData>;
  components?(flow: Flow): Array<Array<Component>>; // action row, components
  getStatus(flow: Flow): "complete" | "incomplete";
  skipIfExists?: boolean;
}