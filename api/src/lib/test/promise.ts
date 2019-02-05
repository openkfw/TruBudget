import { assert } from "chai";

export async function assertIsResolved(promise: Promise<any>, expectedResult?: any): Promise<void> {
  let result: any;
  try {
    result = await promise;
  } catch (error) {
    assert.fail(
      result,
      expectedResult,
      `Should have resolved but failed with ${JSON.stringify(error)}`,
    );
  }
  assert.equal(result, expectedResult);
}

export async function assertIsRejectedWith(promise: Promise<any>): Promise<void> {
  let result: any;
  try {
    result = await promise;
  } catch (error) {
    // assert.instanceOf(error, errorType);
    return;
  }
  assert.fail(result, undefined, "should have failed");
}
