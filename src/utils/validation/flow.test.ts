import { parseFlow } from "./flow";

it("should accept valid flow", () => {
  expect(parseFlow(`{
    "name": "Test",
    "disabled": true,
    "triggers": [
      {
        "type": "each",
        "data": [ 1 ]
      }
    ],
    "actions": [
      {
        "type": "giveRole",
        "data": [ [ "110090225929191424" ] ]
      }
    ]
  }`)).toBeTruthy();

  expect(parseFlow(`{
    "triggers": [
      {
        "type": "countFail",
        "data": []
      }
    ],
    "actions": [
      {
        "type": "pin",
        "data": []
      }
    ]
  }`)).toBeTruthy();
});

it("should reject invalid flow", () => {
  expect(parseFlow(`{
    "name": "Test",
    "disabled": true,
    "triggers": [
      {
        "type": "each",
        "data": [ "something" ]
      }
    ],
    "actions": [
      {
        "type": "giveRole",
        "data": [ [ "110090225929191424" ] ]
      }
    ]
  }`)).toBeFalsy();

  expect(parseFlow(`{
    "name": 123,
    "disabled": false,
    "triggers": [
      {
        "type": "each",
        "data": [ 1 ]
      }
    ],
    "actions": [
      {
        "type": "giveRole",
        "data": [ [ "110090225929191424" ] ]
      }
    ]
  }`)).toBeFalsy();

  expect(parseFlow(`{
    "name": "Test",
    "triggers": [],
    "actions": []
  }`)).toBeFalsy();

  expect(parseFlow(`{
    not valid json
  }`)).toBeFalsy();
});
