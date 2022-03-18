import { DocumentType, getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { Severity, WhatIsIt } from "@typegoose/typegoose/lib/internal/constants";
import type { BeAnObject } from "@typegoose/typegoose/lib/types";
import type { PropertyValue } from "../../@types/flows/properties";
import { Schema } from "mongoose";
import numberSystems from "../../constants/numberSystems";

const saveQueue = new Map();

export class Count {
  @prop({ type: Number, default: 0 }) number!: number;
  @prop({ type: String }) userId?: string;
  @prop({ type: String }) messageId?: string;
}

export class TimeoutRole {
  @prop({ type: String, required: true }) roleId!: string;
  @prop({ type: Number, required: true }) fails!: number;
  @prop({ type: Number, required: true }) time!: number;
  @prop({ type: Number }) duration?: number;
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class TriggerOrActionDetails {
  @prop({ type: String, required: true }) type!: string;
  @prop({ type: [Schema.Types.Mixed], default: []}, WhatIsIt.ARRAY) data!: Array<Array<PropertyValue>>;
}

export class Flow {
  @prop({ type: String }) name?: string;
  @prop({ type: Boolean, default: false }) disabled?: boolean;
  @prop({ type: [TriggerOrActionDetails], default: []}, WhatIsIt.ARRAY) triggers!: Array<TriggerOrActionDetails>;
  @prop({ type: [TriggerOrActionDetails], default: []}, WhatIsIt.ARRAY) actions!: Array<TriggerOrActionDetails>;
}

export class Notification {
  @prop({ type: String, required: true }) userId!: string;
  @prop({ type: TriggerOrActionDetails, required: true }) trigger!: TriggerOrActionDetails;
}

export class Liveboard {
  @prop({ type: String, required: true }) channelId!: string;
  @prop({ type: String, required: true }) messageId!: string;
}

export class CountingChannel {
  @prop({ type: Boolean, default: false }) isThread!: boolean;
  @prop({ type: Count, default: { number: 0 } as Count }) count!: Count;
  @prop({ type: String, default: Object.keys(numberSystems)[0] }) type!: string;
  @prop({ type: [String], default: []}, WhatIsIt.ARRAY) modules!: Array<string>;
  @prop({ type: Number, default: {}}, WhatIsIt.MAP) scores!: Map<string, number>;
  @prop({ type: TimeoutRole, default: null }) timeoutRole?: TimeoutRole;
  @prop({ type: Flow, default: {}}, WhatIsIt.MAP) flows!: Map<string, Flow>;
  @prop({ type: Notification, default: {}}, WhatIsIt.MAP) notifications!: Map<string, Notification>;
  @prop({ type: Date, default: {}}, WhatIsIt.MAP) timeouts!: Map<string, Date>;
  @prop({ type: [String], default: []}, WhatIsIt.ARRAY) filters!: Array<string>;
  @prop({ type: Liveboard, default: null }) liveboard?: Liveboard;
}

export class Guild {
  @prop({ type: String, unique: true, required: true }) guildId!: string;
  @prop({ type: CountingChannel, _id: false, default: {}}, WhatIsIt.MAP) channels!: Map<string, CountingChannel>;
  @prop({ type: Number, _id: false, default: {}}, WhatIsIt.MAP) log!: Map<string, number>;

  // we can't save in parallell, and although we can await the guild.save(), that would not work across files.

  safeSave(this: GuildDocument) {
    if (!saveQueue.has(this.guildId)) {
      saveQueue.set(this.guildId, 1);
      this.save().then(() => {
        if (saveQueue.get(this.guildId) === 2) {
          saveQueue.delete(this.guildId);
          this.safeSave();
        } else saveQueue.delete(this.guildId);
      });
    } else saveQueue.set(this.guildId, 2);
  }
}

export type GuildDocument = DocumentType<Guild, BeAnObject>;

export default getModelForClass(Guild);
