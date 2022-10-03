import { generateId } from "./crypto";

describe("crypto", () => {
  describe("generateId", () => {
    it("should return a random string", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it("should return a string of the correct length", () => {
      const id1 = generateId();
      const id2 = generateId(10);
      expect(id1.length).toBe(6);
      expect(id2.length).toBe(10);
    });
  });
});
