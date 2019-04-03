# Hacking TruBudget

Welcome to the **TruBudget API Source Directory**. This readme file offers an introduction into how the code here is organized. It also mentions some best practices along the way.

Contents:

- [Layout](#layout)
  - [Overview](#overview)
  - [This Directory](#this-directory)
- [Error Handling](#error-handling)

## Layout

### Overview

The source code is organized in _layers_. There are three of them, each with its own _language_ (related to the idea of Ubiquitous Language in Domain-Driven Design): **application**, **service**, and **domain**. The following diagram describes their relationships and also shows some of their vocabulary:

```plain
+--application---------------------------+
|                                        |
|  App                                   |
|  API                                   |
|  HTTP                                  |
|  Route                                 |
|                                        |
|        +--service-------------------+  |
|        |                            |  |
|        |  MultiChain                |  |
|        |  Stream                    |  |
|        |  StreamItem                |  |
|        |  WalletAddress             |  |
|        |  Publisher                 |  |
|        |                            |  |
|        |        +--domain--------+  |  |
|        |        |                |  |  |
|        |        |  Project       |  |  |
|        |        |  Subproject    |  |  |
|        |        |  Workflowitem  |  |  |
|        |        |  Organization  |  |  |
|        |        |  Group         |  |  |
|        |        |  User          |  |  |
|        |        |  Permissions   |  |  |
|        |        |  Notification  |  |  |
|        |        |                |  |  |
|        |        +----------------+  |  |
|        |                            |  |
|        +----------------------------+  |
|                                        |
+----------------------------------------+
```

Note that the inner layer talks about the domain, so it represents a _high level of abstraction_. Conversely, the outer layer talks about the technnical protocol used to invoke the service from other computers on the network, so it represents a _low level of abstraction_.

The concept might sound familiar to you if you've heard of "onion architecture", "ports & adapters" or "hexagonal architecture".

Here are the rules:

- **Don't import or use anything that resides in a parent directory**. An inner layer provides an interface to the outer layer(s). Since the layer is not allowed to refer to anything outside of itself, this interface must be defined in terms of its own language. Consequently, a conversion from one layer's language to another is always done in the layer of lower level of abstraction. This helps to keep the domain layer clear of technical details.
- Never mix levels of abstraction; choose the right layer with that in mind. If you're not sure where to put new code, the words you would use to talk about it might give you a hint. Is it "endpoint", "gRPC" or "GraphQL"? Then you're looking at `src`-level concerns. Is it "caching" or "database"? The service level it is. Are you looking to change who is notified when a certain action happens in a certain way? Sounds business, so it should go into the domain layer. Other things like validation is cross-cutting: the top-level makes sure the request fields are present, while the domain layer validates their values according to business rules (the service layer typically doesn't care about request field validation).
- Within a layer, **group code by feature** into dedicated files.

Some more practical rules:

- A file should either describe an entity or a feature.
- Use `snake_case` for filenames. Although this doesn't seem very idiomatic, with JavaScript it's often not clear how to name files that don't have a default export (it's easy if there's exactly one class in a file, but most of the time that's not the case). By using `snake_case`, it's immediately clear that the filename is different from any functions or classes defined in that file. Additionally, not using upper case letters in filenames improves cross-platform compatibility.
- Write unit tests for the domain layer. Write integration tests for the other layers that test the layer itself plus the layers below. For example, it makes little sense to replace business logic by a mock and test that the database works. Of course, there may be exceptions.
- Put tests into a `.spec.ts` file next to the code under test. For example, code that tests code in `project_update.ts` should go into `project_update.spec.ts`.

### This Directory

This directory defines the **application** context. If you're interested in the general setup, including environment variables and connection setup, take a look at `app.ts`. Most other files are named after the user intent they implement; for example, if a user wants to update a project, the corresponding intent would be `project.update`, with the API implemented in `project_update.ts`. Note that, the intents for creating a project, a subproject and a workflowitem are called `global.createProject`, `project.createSubproject` and `subproject.createWorkflowitem`, respectively.

## Error Handling

### Define custom error types

Generally, errors are defined in the lowest layer they can occur. For example, an event-sourcing error is defined in the domain layer, whereas an HTTP related error is defined in the application layer.

Custom errors should:

- subclass `VError`,
- take an `info` object as first parameter that is specific to the error type and contains enough information to allow a caller to find out what happened,
- take a `cause` as second parameter, which may be an `Error` or, optionally, a `string`,
- set their `name` using the `name` property in their call to `super`.

### Adding context at the call site

Each caller can either handle the error directly or pass the error up the call stack. To do the latter, the error should always be wrapped using [`VError`](https://github.com/joyent/node-verror/), adding additional context information.

Example:

```typescript
// `NotAuthorized` error as defined in the domain layer (`mkInfo` and `mkMessage` omitted here):
class NotAuthorized extends VError {
  constructor(info: Info, cause?: Error) {
    super(
      {
        name: "NotAuthorized",
        cause,
        info: mkInfo(info),
      },
      mkMessage(info),
    );
  }
}

// Low-level function that fails:
function dropSomeTable(ctx: Ctx, userId: string) {
  // do stuff..

  const intent = "drop the table";
  throw new NotAuthorized({ ctx, userId, intent });
}

// High-level function that calls failing low-level function:
function deleteAllData(ctx: Ctx, userId: string) {
  // do stuff..

  try {
    dropSomeTable(ctx, userId);
  } catch (err) {
    // `err` says that the table could not be dropped, but if we'd pass on the error to
    // the caller without adding any context, information on why the operation has been
    // attempted in the first place is lost. By wrapping `err` with `VError`, we can
    // easily add this context information:
    throw new VError(err, "failed to delete all data");
  }
}
```

When handling an error, we can traverse the chain of errors and relate to the errors' names - see [`http_errors.ts`](./http_errors.ts) for details.

### Use [`Result<T>`](./result.ts) to return expected errors

In the previous example, the authorization could be seen as an integral part of the business logic behind `dropSomeTable`. We can model this using the [`Result.Type<T>`](./result.ts).

**Use `Result<T>` whenever a function may fail for non-technical reasons.**

Technical reasons refer to disk or network failures, and so on. Non-technical reasons are insufficient permissions, missing entities, values that are out-of-range, etc.

For example, consider the good old divide-by-zero example:

```typescript
// Without Result, using throw/catch:

function divide_or_throw(a: number, b: number): number {
  if (b === 0) throw new Error("division by zero");
  return a / b;
}

try {
  const res = divide_or_throw(1, 0);
} catch (error) {
  console.error(error);
}

// With Result, you return the error instead of throwing it:

function divide(a: number, b: number): Result.Type<number> {
  return b === 0 ? new Error("division by zero") : a / b;
}

const res = divide(1, 0);
if (Result.isErr(res)) {
  console.error(res);
}
```

Note how the function signature makes it very clear what to expect in the second case, while the first signature is quite misleading - it suggests you pass it two numbers and get back a number in return, while in fact it does so for most, but not for _all_ numbers. Also, the try/catch approach makes it easy to catch errors you didn't anticipate and, because of this, didn't mean to catch.

With that in mind, we can rewrite the previous example:

```typescript
// Simplified version of the `NotAuthorized` error defined in the domain layer:
class NotAuthorized extends Error {
  ...
}

// In this case, the `T` in `Result<T>` is `undefined` because the function doesn't
// return a value; instead it returns either `undefined` or an `Error`.
function dropSomeTable(userId: string): Result.Type<undefined> {
  // do stuff..

  // Instead of `throw`ing the error, we `return` it here:
  return new NotAuthorized(userId, "table.drop");
}

function deleteAllData(userId: string): Result.Type<undefined> {
  // do stuff..

  // The result is either a value (`undefined` in this case) or an Error:
  const result = dropSomeTable(userId);
  // If it is an Error, we wrap it using `VError` like before:
  return Result.mapErr(
    result,
    err => new VError(err, "failed to delete all data"),
  );
}
```
