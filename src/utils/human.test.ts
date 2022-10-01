import { bytesToHumanReadable } from "./human";

describe("human", () => {
  describe("bytesToHumanReadable", () => {
    it("should handle bytes", () => {
      expect(bytesToHumanReadable(1)).toBe("1 B");
      expect(bytesToHumanReadable(5)).toBe("5 B");
    });

    it("should handle kilobytes", () => {
      expect(bytesToHumanReadable(1024)).toBe("1 kB");
      expect(bytesToHumanReadable(5000)).toBe("4.88 kB");
    });

    it("should handle megabytes", () => {
      expect(bytesToHumanReadable(1024 * 1024)).toBe("1 MB");
      expect(bytesToHumanReadable(5000 * 1024)).toBe("4.88 MB");
    });

    it("should handle gigabytes", () => {
      expect(bytesToHumanReadable(1024 * 1024 * 1024)).toBe("1 GB");
      expect(bytesToHumanReadable(5000 * 1024 * 1024)).toBe("4.88 GB");
    });

    it("should handle terabytes", () => {
      expect(bytesToHumanReadable(1024 * 1024 * 1024 * 1024)).toBe("1 TB");
      expect(bytesToHumanReadable(5000 * 1024 * 1024 * 1024)).toBe("4.88 TB");
    });
  });
});
