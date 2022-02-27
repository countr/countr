import { CommandPermissionLevel } from "../../constants/permissions";

const permissions: Record<string, CommandPermissionLevel> = {
  channels: "ADMIN",
  data: "OWNER",
  filters: "MOD",
  flows: "ADMIN",
  liveboard: "ADMIN",
  module: "ADMIN",
  scores: "ADMIN",
  set: "ADMIN",
  timeoutrole: "ADMIN",
};

export default permissions;
