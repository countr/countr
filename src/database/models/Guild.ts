/* eslint-disable max-classes-per-file */
import type { DocumentType } from "@typegoose/typegoose";
import type { Snowflake } from "discord.js";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { PropType, Severity } from "@typegoose/typegoose/lib/internal/constants";
import { Schema } from "mongoose";
import type { Action } from "../../constants/flows/actions";
import type actions from "../../constants/flows/actions";
import type modules from "../../constants/modules";
import type { Trigger } from "../../constants/triggers";
import type triggers from "../../constants/triggers";
import numberSystems from "../../constants/numberSystems";

@modelOptions({ schemaOptions: { _id: false } })
export class CountSchema {
  @prop({ type: String }) messageId?: Snowflake;
  @prop({ type: Number, default: 0 }) number!: number;
  @prop({ type: String }) userId?: Snowflake;
}

@modelOptions({ schemaOptions: { _id: false } })
export class TimeoutRoleSchema {
  @prop({ type: Number }) duration?: number;
  @prop({ type: Number, required: true }) fails!: number;
  @prop({ type: String, required: true }) roleId!: Snowflake;
  @prop({ type: Number, required: true }) timePeriod!: number;
}

type ExtractFromTrigger<Type extends keyof typeof triggers = keyof typeof triggers, T = typeof triggers[Type]> = T extends Trigger<infer U> ? U : never;
type ExtractFromAction<Type extends keyof typeof actions = keyof typeof actions, T = typeof actions[Type]> = T extends Action<infer U> ? U : never;

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class TriggerDetailsSchema<Type extends keyof typeof triggers = keyof typeof triggers> {
  @prop({ type: [Schema.Types.Mixed], default: [] }, PropType.ARRAY) data!: ExtractFromTrigger<Type>;
  @prop({ type: String, required: true }) type!: Type;
}

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class ActionDetailsSchema<Type extends keyof typeof actions = keyof typeof actions> {
  @prop({ type: [Schema.Types.Mixed], default: [] }, PropType.ARRAY) data!: ExtractFromAction<Type>;
  @prop({ type: String, required: true }) type!: Type;
}

@modelOptions({ schemaOptions: { _id: false } })
export class FlowSchema {
  @prop({ type: Boolean, default: false }) actionIsRandomized!: boolean;
  @prop({ type: [ActionDetailsSchema], default: [] }, PropType.ARRAY) actions!: ActionDetailsSchema[];
  @prop({ type: Boolean, default: false }) allTriggersMustPass!: boolean;
  @prop({ type: Boolean, default: false }) disabled!: boolean;
  @prop({ type: String }) name?: string;
  @prop({ type: [TriggerDetailsSchema], default: [] }, PropType.ARRAY) triggers!: TriggerDetailsSchema[];
}

@modelOptions({ schemaOptions: { _id: false } })
export class NotificationSchema {
  @prop({ type: TriggerDetailsSchema, required: true }) trigger!: TriggerDetailsSchema;
  @prop({ type: String, required: true }) userId!: Snowflake;
}

@modelOptions({ schemaOptions: { _id: false } })
export class LiveboardSchema {
  @prop({ type: String, required: true }) channelId!: Snowflake;
  @prop({ type: String, required: true }) messageId!: Snowflake;
}

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class CountingChannelSchema {
  @prop({ type: [String], default: [] }, PropType.ARRAY) bypassableRoles!: Snowflake[];
  @prop({ type: CountSchema, default: { number: 0 } as CountSchema }) count!: CountSchema;
  @prop({ type: [String], default: [] }, PropType.ARRAY) filters!: string[];
  @prop({ type: FlowSchema, default: {} }, PropType.MAP) flows!: Map<string, FlowSchema>;
  @prop({ type: Number, default: 1 }) increment!: number;
  @prop({ type: Boolean, default: false }) isThread!: boolean;
  @prop({ type: LiveboardSchema, default: null }) liveboard!: LiveboardSchema | null;
  // extra metadata for individual features
  @prop({ type: Schema.Types.Mixed, default: {} }, PropType.MAP) metadata!:
  & Map<`positionRole-${Snowflake}`, Snowflake>
  & Map<`uniqueRole-${Snowflake}`, Snowflake>;
  @prop({ type: [String], default: [] }, PropType.ARRAY) modules!: Array<keyof typeof modules>;
  @prop({ type: NotificationSchema, default: {} }, PropType.MAP) notifications!: Map<string, NotificationSchema>;
  @prop({ type: String, default: {} }, PropType.MAP) positionRoles!: Map<`${number}`, Snowflake>;
  @prop({ type: Number, default: {} }, PropType.MAP) scores!: Map<Snowflake, number>;
  @prop({ type: TimeoutRoleSchema, default: null }) timeoutRole!: null | TimeoutRoleSchema;
  @prop({ type: Date, default: {} }, PropType.MAP) timeouts!: Map<Snowflake, Date>;

  @prop({ type: String, default: Object.keys(numberSystems)[0] }) type!: keyof typeof numberSystems;
}

const saveQueue = new Map<Snowflake, 1 | 2>();

export class GuildSchema {
  @prop({ type: CountingChannelSchema, default: {} }, PropType.MAP) channels!: Map<Snowflake, CountingChannelSchema>;
  @prop({ type: String, unique: true, required: true }) guildId!: Snowflake;

  // if we ever need the "default" counting channel, we use this function to avoid repetitive code.
  getDefaultCountingChannel(this: GuildDocument): [Snowflake, CountingChannelSchema] | null {
    const channels = Array.from(this.channels);
    if (channels.length === 1) return channels[0]!;
    return null;
  }

  // we can't save in parallell, and although we can await the guild.save(), that would not work across files.
  safeSave(this: GuildDocument): void {
    if (saveQueue.has(this.guildId)) return void saveQueue.set(this.guildId, 2);

    saveQueue.set(this.guildId, 1);
    return void this.save().then(() => {
      if (saveQueue.get(this.guildId) === 2) {
        saveQueue.delete(this.guildId);
        this.safeSave();
      } else saveQueue.delete(this.guildId);
    });
  }
}

export type GuildDocument = DocumentType<GuildSchema>;

export const Guild = getModelForClass(GuildSchema);
