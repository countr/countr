import type { AnySelectMenuInteraction, Awaitable, ButtonInteraction, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, RoleSelectMenuInteraction, Snowflake, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import { ComponentType } from "discord.js";

interface BaseComponent {
  allowedUsers: "all" | [Snowflake, ...Snowflake[]];
  garbageCollect?: Date | false;
}

interface ButtonComponent extends BaseComponent {
  callback(interaction: ButtonInteraction<"cached">): Awaitable<void>;
}

interface ChannelSelectMenuComponent extends BaseComponent {
  selectType: "channel";
  callback(interaction: ChannelSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface MentionableSelectMenuComponent extends BaseComponent {
  selectType: "mentionable";
  callback(interaction: MentionableSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface RoleSelectMenuComponent extends BaseComponent {
  selectType: "role";
  callback(interaction: RoleSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface StringSelectMenuComponent extends BaseComponent {
  selectType: "string";
  callback(interaction: StringSelectMenuInteraction<"cached">): Awaitable<void>;
}

interface UserSelectMenuComponent extends BaseComponent {
  selectType: "user";
  callback(interaction: UserSelectMenuInteraction<"cached">): Awaitable<void>;
}

export const buttonComponents = new Map<string, ButtonComponent>();
export const selectMenuComponents = new Map<string, ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent>();

export default function componentHandler(interaction: AnySelectMenuInteraction<"cached"> | ButtonInteraction<"cached">): void {
  if (interaction.isButton()) {
    const component = buttonComponents.get(interaction.customId);
    if (component && (component.allowedUsers === "all" || component.allowedUsers.includes(interaction.user.id))) void component.callback(interaction);
  } else if (interaction.isAnySelectMenu()) {
    const component = selectMenuComponents.get(interaction.customId);
    if (component && (component.allowedUsers === "all" || component.allowedUsers.includes(interaction.user.id)) && selectComponentMatchesInteractionType(interaction, component)) void component.callback(interaction as never);
  }
}

export const selectTypes: Record<(ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent)["selectType"], ComponentType> = {
  channel: ComponentType.ChannelSelect,
  mentionable: ComponentType.MentionableSelect,
  role: ComponentType.RoleSelect,
  string: ComponentType.StringSelect,
  user: ComponentType.UserSelect,
} as const;

function selectComponentMatchesInteractionType(interaction: AnySelectMenuInteraction<"cached">, component: ChannelSelectMenuComponent | MentionableSelectMenuComponent | RoleSelectMenuComponent | StringSelectMenuComponent | UserSelectMenuComponent): boolean {
  return selectTypes[component.selectType] === interaction.componentType;
}

export function getSelectTypeFromComponentType(componentType: ComponentType): keyof typeof selectTypes {
  return Object.entries(selectTypes).find(([, type]) => type === componentType)![0] as never;
}

const pendingGarbage = new Map<string, Date>();
if (!process.env["JEST_WORKER_ID"]) {
  setInterval(() => {
    const now = new Date();
    pendingGarbage.forEach((date, key) => {
      if (now < date) return;

      buttonComponents.delete(key);
      selectMenuComponents.delete(key);
      pendingGarbage.delete(key);
    });

    [...Array.from(buttonComponents.entries()), ...Array.from(selectMenuComponents.entries())].forEach(([key, { garbageCollect }]) => {
      if (garbageCollect === false || pendingGarbage.has(key)) return;

      const date = garbageCollect ?? new Date(now.getTime() + 3600000);
      pendingGarbage.set(key, date);
    });
  }, 300000);
}
