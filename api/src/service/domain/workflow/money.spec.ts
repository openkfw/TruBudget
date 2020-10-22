import { assert } from "chai";

import { isAmountOfMoney } from "./money";

describe("An amount of money", () => {
  it("may be a positive integer.", async () => {
    assert.isTrue(isAmountOfMoney("123"));
  });

  it("may be a negative integer.", async () => {
    assert.isTrue(isAmountOfMoney("-123"));
    assert.isTrue(isAmountOfMoney("- 123"));
  });

  it("may be a positive float.", async () => {
    assert.isTrue(isAmountOfMoney("123.45"));
  });

  it("may be a negative float.", async () => {
    assert.isTrue(isAmountOfMoney("-123.45"));
    assert.isTrue(isAmountOfMoney("- 123.45"));
  });

  it("match english notation.", async () => {
    assert.isFalse(isAmountOfMoney("123,45"));
    assert.isTrue(isAmountOfMoney("1,234.56"));
    assert.isFalse(isAmountOfMoney("1.234,56"));
  });

  it("must not contain a currency (or generic string).", async () => {
    assert.isFalse(isAmountOfMoney("EUR 123"));
    assert.isFalse(isAmountOfMoney("123 EUR"));
  });
});
