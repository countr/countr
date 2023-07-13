/* eslint-disable max-classes-per-file */
import type { DocumentType } from "@typegoose/typegoose";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { PropType, Severity } from "@typegoose/typegoose/lib/internal/constants";
import type { Snowflake } from "discord.js";
import { Schema } from "mongoose";
import type { Action } from "../../constants/flows/actions";
import type actions from "../../constants/flows/actions";
import type modules from "../../constants/modules";
import numberSystems from "../../constants/numberSystems";
import type { Trigger } from "../../constants/triggers";
import type triggers from "../../constants/triggers";

@modelOptions({ schemaOptions: { _id: false } })
export class CountSchema {
  @prop({ type: Number, default: 0 }) number!: number;
  @prop({ type: String }) userId?: Snowflake;
  @prop({ type: String }) messageId?: Snowflake;
}

@modelOptions({ schemaOptions: { _id: false } })
export class TimeoutRoleSchema {
  @prop({ type: String, required: true }) roleId!: Snowflake;
  @prop({ type: Number, required: true }) fails!: number;
  @prop({ type: Number, required: true }) timePeriod!: number;
  @prop({ type: Number }) duration?: number;
}

type ExtractFromTrigger<Type extends keyof typeof triggers = keyof typeof triggers, T = typeof triggers[Type]> = T extends Trigger<infer U> ? U : never;
type ExtractFromAction<Type extends keyof typeof actions = keyof typeof actions, T = typeof actions[Type]> = T extends Action<infer U> ? U : never;

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class TriggerDetailsSchema<Type extends keyof typeof triggers = keyof typeof triggers> {
  @prop({ type: String, required: true }) type!: Type;
  @prop({ type: [Schema.Types.Mixed], default: [] }, PropType.ARRAY) data!: ExtractFromTrigger<Type>;
}

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class ActionDetailsSchema<Type extends keyof typeof actions = keyof typeof actions> {
  @prop({ type: String, required: true }) type!: Type;
  @prop({ type: [Schema.Types.Mixed], default: [] }, PropType.ARRAY) data!: ExtractFromAction<Type>;
}

@modelOptions({ schemaOptions: { _id: false } })
export class FlowSchema {
  @prop({ type: String }) name?: string;
  @prop({ type: Boolean, default: false }) disabled!: boolean;
  @prop({ type: [TriggerDetailsSchema], default: [] }, PropType.ARRAY) triggers!: TriggerDetailsSchema[];
  @prop({ type: [ActionDetailsSchema], default: [] }, PropType.ARRAY) actions!: ActionDetailsSchema[];
  @prop({ type: Boolean, default: false }) actionIsRandomized!: boolean;
}

@modelOptions({ schemaOptions: { _id: false } })
export class NotificationSchema {
  @prop({ type: String, required: true }) userId!: Snowflake;
  @prop({ type: TriggerDetailsSchema, required: true }) trigger!: TriggerDetailsSchema;
}

@modelOptions({ schemaOptions: { _id: false } })
export class LiveboardSchema {
  @prop({ type: String, required: true }) channelId!: Snowflake;
  @prop({ type: String, required: true }) messageId!: Snowflake;
}

@modelOptions({ schemaOptions: { _id: false }, options: { allowMixed: Severity.ALLOW } })
export class CountingChannelSchema {
  @prop({ type: Boolean, default: false }) isThread!: boolean;
  @prop({ type: String, default: Object.keys(numberSystems)[0] }) type!: keyof typeof numberSystems;
  @prop({ type: Number, default: 1 }) increment!: number;
  @prop({ type: CountSchema, default: { number: 0 } as CountSchema }) count!: CountSchema;
  @prop({ type: [String], default: [] }, PropType.ARRAY) modules!: Array<keyof typeof modules>;
  @prop({ type: Number, default: {} }, PropType.MAP) scores!: Map<Snowflake, number>;
  @prop({ type: TimeoutRoleSchema, default: null }) timeoutRole!: TimeoutRoleSchema | null;
  @prop({ type: FlowSchema, default: {} }, PropType.MAP) flows!: Map<string, FlowSchema>;
  @prop({ type: NotificationSchema, default: {} }, PropType.MAP) notifications!: Map<string, NotificationSchema>;
  @prop({ type: Date, default: {} }, PropType.MAP) timeouts!: Map<Snowflake, Date>;
  @prop({ type: [String], default: [] }, PropType.ARRAY) filters!: string[];
  @prop({ type: [String], default: [] }, PropType.ARRAY) bypassableRoles!: Snowflake[];
  @prop({ type: LiveboardSchema, default: null }) liveboard!: LiveboardSchema | null;
  @prop({ type: String, default: {} }, PropType.MAP) positionRoles!: Map<`${number}`, Snowflake>;

  // extra metadata for individual features
  @prop({ type: Schema.Types.Mixed, default: {} }, PropType.MAP) metadata!:
  & Map<`positionRole-${Snowflake}`, Snowflake>
  & Map<`uniqueRole-${Snowflake}`, Snowflake>;
}

const saveQueue = new Map<Snowflake, 1 | 2>();

export class GuildSchema {
  @prop({ type: String, unique: true, required: true }) guildId!: Snowflake;
  @prop({ type: CountingChannelSchema, default: {} }, PropType.MAP) channels!: Map<Snowflake, CountingChannelSchema>;

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
