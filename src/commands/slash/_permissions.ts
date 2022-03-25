import { PermissionLevel } from "../../constants/permissions";

const permissions: Record<string, PermissionLevel> = {
  channels: PermissionLevel.ADMINISTRATOR,
  data: PermissionLevel.OWNER,
  filters: PermissionLevel.MODERATOR,
  flows: PermissionLevel.ADMINISTRATOR,
  liveboard: PermissionLevel.ADMINISTRATOR,
  module: PermissionLevel.ADMINISTRATOR,
  scores: PermissionLevel.ADMINISTRATOR,
  set: PermissionLevel.ADMINISTRATOR,
  timeoutrole: PermissionLevel.ADMINISTRATOR,
};

export default permissions;
