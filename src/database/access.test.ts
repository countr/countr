import config from "../config";
import { filterGuildsWithAccess } from "./access";
import { Access } from "./models/Access";

// mock the config module
jest.mock("../config", () => ({
  guild: "123456789",
}));

// mock the Access model
jest.mock("./models/Access", () => ({
  Access: {
    find: jest.fn(),
  },
}));

const mockedAccess = Access as jest.Mocked<typeof Access>;

describe("filterGuildsWithAccess", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return guilds that have access in database", async () => {
    const guildIds = ["111", "222", "333"];
    const mockAccessDocuments = [
      { guildIds: ["111", "222"] },
      { guildIds: ["333"] },
    ];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    expect(result).toStrictEqual(["111", "222", "333"]);
  });

  it("should exclude guilds without access from database", async () => {
    const guildIds = ["111", "222", "333"];
    const mockAccessDocuments = [{ guildIds: ["111"] }];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    expect(result).toStrictEqual(["111"]);
  });

  it("should always include main guild even if not in database", async () => {
    // 123456789 is the mocked config.guild
    const guildIds = ["111", "222", "123456789"];
    // only guild 111 has access, main guild 123456789 does not
    const mockAccessDocuments = [{ guildIds: ["111"] }];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    // main guild should be included
    expect(result).toStrictEqual(["111", "123456789"]);
  });

  it("should not duplicate main guild if it already has access", async () => {
    // 123456789 is the mocked config.guild
    const guildIds = ["111", "222", "123456789"];
    // main guild already has access
    const mockAccessDocuments = [{ guildIds: ["111", "123456789"] }];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    // no duplication
    expect(result).toStrictEqual(["111", "123456789"]);
  });

  it("should handle when main guild is not in the input list", async () => {
    // main guild not in the list
    const guildIds = ["111", "222"];
    const mockAccessDocuments = [{ guildIds: ["111"] }];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    // main guild not added since it's not in input
    expect(result).toStrictEqual(["111"]);
  });

  it("should handle when config.guild is null", async () => {
    // temporarily mock config.guild as null
    const originalGuild = config.guild;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (config as any).guild = null;

    const guildIds = ["111", "222"];
    const mockAccessDocuments = [{ guildIds: ["111"] }];

    mockedAccess.find.mockResolvedValue(mockAccessDocuments as never);

    const result = await filterGuildsWithAccess(guildIds);
    expect(result).toStrictEqual(["111"]);

    // restore original value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (config as any).guild = originalGuild;
  });
});
