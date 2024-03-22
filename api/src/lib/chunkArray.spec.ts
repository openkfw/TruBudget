import { expect } from "chai";
import { chunkArray } from "./chunkArray";

describe("chunkArray", () => {
  it("should split an array into chunks of the specified size", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunkSize = 3;
    const expected = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(chunkArray(array, chunkSize)).to.equal(expected);
  });

  it("should handle chunk sizes that do not evenly divide the array length", () => {
    const array = [1, 2, 3, 4, 5, 6, 7];
    const chunkSize = 3;
    const expected = [[1, 2, 3], [4, 5, 6], [7]];
    expect(chunkArray(array, chunkSize)).to.equal(expected);
  });

  it("should handle a chunk size of 1", () => {
    const array = [1, 2, 3];
    const chunkSize = 1;
    const expected = [[1], [2], [3]];
    expect(chunkArray(array, chunkSize)).to.equal(expected);
  });

  it("should handle a chunk size greater than the array length", () => {
    const array = [1, 2, 3];
    const chunkSize = 5;
    const expected = [[1, 2, 3]];
    expect(chunkArray(array, chunkSize)).to.equal(expected);
  });

  it("should handle a chunk size of 0 and default to 10", () => {
    const array = [1, 2, 3];
    const chunkSize = 0;
    const expected = [[1, 2, 3]];
    expect(chunkArray(array, chunkSize)).to.deep.equal(expected);
  });

  it("should handle NaN and default chunk size to 10", () => {
    const array = [1, 2, 3];
    const chunkSize = NaN;
    const expected = [[1, 2, 3]];
    expect(chunkArray(array, chunkSize)).to.deep.equal(expected);
  });

  it("should handle a number string as chunk size", () => {
    const array = Array.from({ length: 100 }, (_, i) => i + 1);
    const chunkSize = "20";
    const expected = Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 20 }, (_, j) => i * 20 + j + 1),
    );
    expect(chunkArray(array, chunkSize)).to.deep.equal(expected);
  });

  it("should handle an alphabetic string as chunk size", () => {
    const array = Array.from({ length: 100 }, (_, i) => i + 1);
    const chunkSize = "abc";
    const expected = [array];
    expect(chunkArray(array, chunkSize)).to.deep.equal(expected);
  });
});
