import { CommandPermissionLevel } from "../../constants/permissions";

const permissions: Record<string, CommandPermissionLevel> = {
  eval: "DEVELOPER",
  ping: "ALL",
};

export default permissions;
