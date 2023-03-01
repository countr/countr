import { parseScores } from "./scores";

test("should accept valid scores", () => {
  expect(parseScores(`{
    "110090225929191424": 123
  }`)).toBeTruthy();

  expect(parseScores(`{
    "110090225929191424": 123,
    "467377486141980682": 0
  }`)).toBeTruthy();
});

test("should reject invalid scores", () => {
  expect(parseScores(`{
    "110090225929191424": "10000"
  }`)).toBeFalsy();

  expect(parseScores(`{
    "ddd": 123
  }`)).toBeFalsy();

  expect(parseScores(`{
    "110090225929191424000000000000": 3
  }`)).toBeFalsy();

  expect(parseScores(`{
    "110090225929191424": -1
  }`)).toBeFalsy();

  expect(parseScores(`{
    not valid json
  }`)).toBeFalsy();
});
