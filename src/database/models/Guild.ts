import { prop, getModelForClass, DocumentType } from "@typegoose/typegoose";

const saveQueue = new Map();

export class Count {
  @prop({ default: 0 })  public number!: number;
  @prop({ default: "" }) public userId!: string;
  @prop({ default: "" }) public messageId!: string;
}

export class TimeoutRole {
  @prop({ required: true }) public roleId!: string;
  @prop({ required: true }) public fails!: number;
  @prop({ required: true }) public time!: number;
  @prop({ default: null })  public duration?: number;
}

export class FlowOptions {
  @prop({ required: true }) public type!: string;
  @prop({ default: [] })    public data?: Array<unknown>;
}

export class Flow {
  @prop({ required: true }) public triggers!: Array<FlowOptions>;
  @prop({ required: true }) public actions!: Array<FlowOptions>;
}

export class Notification {
  @prop({ required: true })  public userId!: string;
  @prop({ default: "only" }) public mode?: string;
  @prop({ required: true })  public count!: number;
}

export class Liveboard {
  @prop({ required: true }) public channelId!: string;
  @prop({ required: true }) public messageId!: string;
}

export class CountingChannel {
  @prop({ default: {
    number: 0,
    userId: "",
    messageId: ""
  } as Count })                 public count!: Count;
  @prop({ default: "decimal" }) public type?: string;
  @prop({ default: [] })        public modules?: Array<string>;
  @prop({ default: {} })        public scores?: Map<string, number>;
  @prop({ default: {} })        public timeoutRole?: TimeoutRole | Record<string, never>; // empty object
  @prop({ default: {} })        public flows?: Map<string, Flow>;
  @prop({ default: {} })        public notifications?: Map<string, Notification>;
  @prop({ default: {} })        public timeouts?: Map<string, Date>;
  @prop({ default: [] })        public filters?: Array<string>;
  @prop({ default: {} })        public liveboard?: Liveboard | Record<string, never>; // empty object
}

export class Guild {
  @prop({ required: true }) public guildId!: string;
  @prop({ default: {} })    public channels!: Map<string, CountingChannel>;
  @prop({ default: {} })    public log!: Map<string, number>;

  // we can't save in parallell, and although we can await the guild.save(), that would not work across files.

  public safeSave(this: DocumentType<Guild>): void {
    if (!saveQueue.has(this.guildId)) {
      saveQueue.set(this.guildId, 1);
      this.save().then(() => {
        if (saveQueue.get(this.guildId) == 2) {
          saveQueue.delete(this.guildId);
          this.safeSave();
        } else saveQueue.delete(this.guildId);
      });
    } else saveQueue.set(this.guildId, 2);
  }
}

export default getModelForClass(Guild);