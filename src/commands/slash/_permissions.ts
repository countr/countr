import { CommandPermissionLevel } from "../../constants/permissions";

const permissions: Record<string, CommandPermissionLevel> = {
  channels: "ADMIN",
  data: "OWNER",
  flows: "ADMIN",
};

export default permissions;
