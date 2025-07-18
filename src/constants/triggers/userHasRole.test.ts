import { Collection, type GuildMember, type Role } from "discord.js";
import type { CountingData } from "../../handlers/counting";
import userHasRole from "./userHasRole";

// Mock objects for testing
const createMockRole = (id: string): Role => ({
  id,
} as Role);

const createMockMember = (roleIds: string[]): GuildMember => {
  const roles = new Collection<string, Role>();
  roleIds.forEach(roleId => {
    roles.set(roleId, createMockRole(roleId));
  });
  
  return {
    roles: {
      cache: roles,
    },
  } as GuildMember;
};

const createMockCountingData = (member: GuildMember): CountingData => ({
  member,
} as CountingData);

describe("userHasRole trigger", () => {
  test("should trigger when user has one of the specified roles", () => {
    const member = createMockMember(["role1", "role2", "role3"]);
    const countingData = createMockCountingData(member);
    
    // Should trigger when user has one of the specified roles
    expect(userHasRole.check!(countingData, [["role1", "role4"]])).toBe(true);
    expect(userHasRole.check!(countingData, [["role2"]])).toBe(true);
    expect(userHasRole.check!(countingData, [["role3", "role4", "role5"]])).toBe(true);
  });

  test("should not trigger when user has none of the specified roles", () => {
    const member = createMockMember(["role1", "role2", "role3"]);
    const countingData = createMockCountingData(member);
    
    // Should not trigger when user has none of the specified roles
    expect(userHasRole.check!(countingData, [["role4", "role5"]])).toBe(false);
    expect(userHasRole.check!(countingData, [["role6"]])).toBe(false);
  });

  test("should not trigger when user has no roles", () => {
    const member = createMockMember([]);
    const countingData = createMockCountingData(member);
    
    // Should not trigger when user has no roles
    expect(userHasRole.check!(countingData, [["role1", "role2"]])).toBe(false);
  });

  test("should have correct properties", () => {
    expect(userHasRole.name).toBe("User has role");
    expect(userHasRole.supports).toEqual(["flows", "notifications"]);
    expect(userHasRole.properties).toHaveLength(1);
    expect(userHasRole.check).toBeDefined();
    expect(userHasRole.explanation).toBeDefined();
  });

  test("should generate correct explanation", () => {
    expect(userHasRole.explanation([["role1"]])).toBe("When someone with the role <@&role1> counts");
    expect(userHasRole.explanation([["role1", "role2"]])).toBe("When someone with any of the roles <@&role1>, <@&role2> counts");
    expect(userHasRole.explanation([["role1", "role2", "role3"]])).toBe("When someone with any of the roles <@&role1>, <@&role2>, <@&role3> counts");
  });
});