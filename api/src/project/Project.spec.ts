import { assert } from "chai";

import { validateProject } from "./Project";

function validInput() {
  return {
    id: "testproject-0001",
    creationUnixTs: `${new Date().getTime()}`,
    status: "open",
    displayName: "A test project",
    assignee: "my-user",
    description: "This is a project created for, and during, testing.",
    amount: "1234",
    currency: "EUR",
    thumbnail: "",
    permissions: {},
  };
}

function assertString(input: any, field: string, errorMessage: RegExp) {
  const origValue = input[field];

  // The field must be set:
  delete input[field];
  assert.throws(() => validateProject(input), errorMessage);

  // The field must be a string:
  input[field] = 1;
  assert.throws(() => validateProject(input), errorMessage);

  // Finally, a non-empty string is accepted:
  input[field] = "some string";
  assert.doesNotThrow(() => validateProject(input));

  // Restore the original value:
  input[field] = origValue;
}

function assertNonemptyString(input: any, field: string, errorMessage: RegExp) {
  const origValue = input[field];

  // The field must be set:
  delete input[field];
  assert.throws(() => validateProject(input), errorMessage);

  // The field must be a string:
  input[field] = 1;
  assert.throws(() => validateProject(input), errorMessage);

  // A field cannot be empty:
  input[field] = "";
  assert.throws(() => validateProject(input), errorMessage);

  // Finally, a non-empty string is accepted:
  input[field] = "some string";
  assert.doesNotThrow(() => validateProject(input));

  // Restore the original value:
  input[field] = origValue;
}

function assertOptionalNonemptyString(input: any, field: string, errorMessage: RegExp) {
  const origValue = input[field];

  // The field may be unset:
  delete input[field];
  assert.doesNotThrow(() => validateProject(input));

  // If set, the field must be a string:
  input[field] = 1;
  assert.throws(() => validateProject(input), errorMessage);

  // If set, field cannot be empty:
  input[field] = "";
  assert.throws(() => validateProject(input), errorMessage);

  // If set, a non-empty string is accepted:
  input[field] = "some string";
  assert.doesNotThrow(() => validateProject(input));

  // Restore the original value:
  input[field] = origValue;
}

describe("A project entity", () => {
  it("validates its parameters.", async () => {
    const input: any = validInput();
    assertNonemptyString(input, "id", new RegExp("id"));
    assertNonemptyString(input, "creationUnixTs", new RegExp("unix timestamp"));
    assert.isNumber(Number(input.creationUnixTs));
    assert.include(["open", "closed"], input.status);
    assertNonemptyString(input, "displayName", new RegExp("display name"));
    assertOptionalNonemptyString(input, "assignee", new RegExp("assignee"));
    assertString(input, "description", new RegExp("description"));
    assertNonemptyString(input, "amount", new RegExp("amount"));
    assertNonemptyString(input, "currency", new RegExp("currency"));
    assertString(input, "thumbnail", new RegExp("thumbnail"));
    assert.isObject(input.permissions);
  });
});
