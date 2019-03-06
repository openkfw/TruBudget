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
export function assertUnreachable(x: never): never {
  console.trace();
  throw new Error("Didn't expect to get here");
}
