/**
 * Only used to implement an exhaustive-check for switch statements.
 *
 * ## Example:
 *
 *    ```typescript
 *    const x: "foo" | "bar" = "foo";
 *    switch (x) {
 *      case "foo":
 *        console.log("foo");
 *        break;
 *      case "bar":
 *        console.log("bar");
 *        break;
 *      default:
 *        // The compiler will tell you in case you forgot a case:
 *        assertUnreachable(x);
 *    }
 *    ```
 */

import logger from "./logger";

export function assertUnreachable(_x: never): never {
  logger.trace();
  throw new Error("Didn't expect to get here");
}
