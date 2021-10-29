import { CommandPermissionLevel } from "../../constants/permissions";

const permissions: Record<string, CommandPermissionLevel> = {
  eval: "DEVELOPER",
  ping: "ALL",
  respawnshard: "SUPPORT",
};

export default permissions;
