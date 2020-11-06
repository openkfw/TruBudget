import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { closeProject } from "./project_close";
import { Subproject } from "./subproject";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const baseProject: Project = {
  id: projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  projectedBudgets: [],
  permissions: {},
  log: [],
  additionalData: {},
  tags: [],
};
const baseSubproject: Subproject = {
  id: "dummy-subproject",
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: {},
  log: [],
  additionalData: {},
};
const baseRepository = {
  getSubprojects: async (_projectId) => [],
  getUsersForIdentity: async (identity) => {
    if (identity === "alice") return ["alice"];
    if (identity === "bob") return ["bob"];
    if (identity === "charlie") return ["charlie"];
    if (identity === "alice_and_bob") return ["alice", "bob"];
    if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
    if (identity === "root") return ["root"];
    throw Error(`unexpected identity: ${identity}`);
  },
};

describe("close project: preconditions", () => {
  it("A user may not close a project if he/she is not assigned", async () => {
    const result = await closeProject(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, assignee: bob.id }),
    });

    // PreconditionError error due to no assignment:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("The root user doesn't need to be assigned to close a project.", async () => {
    const result = await closeProject(ctx, root, projectId, {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, permissions: {} }),
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A project may not be closed if there is at least one non-closed subproject.", async () => {
    const result = await closeProject(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, status: "open" }),
      getSubprojects: async (_projectId) => [{ ...baseSubproject, status: "open" }],
    });

    // PreconditionError due to open subproject:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("Closing a project fails if the project cannot be found.", async () => {
    const result = await closeProject(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => new Error("some error"),
    });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});

describe("close project: notifications", () => {
  it("Closing an already closed project works, but nothing happens and no notifications are issued.", async () => {
    const result = await closeProject(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, status: "closed", assignee: bob.id }),
    });

    // It worked:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) throw result;
    const { newEvents } = result;

    // It's a no-op:
    assert.lengthOf(newEvents, 0);
  });

  it("If the user that closes a project is assigned to the project herself, no notifications are issued.", async () => {
    const result = await closeProject(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, status: "open", assignee: alice.id }),
    });

    // There is an event representing the operation, but no notification:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const { newEvents } = result;
    assert.isTrue(newEvents.length > 0);
    assert.isFalse(newEvents.some((event) => event.type === "notification_created"));
  });

  it(
    "If a project is assigned to a group when closing it, " +
      "each member, except for the user that closes it, receives a notificaton.",
    async () => {
      const group = "alice_and_bob_and_charlie";
      const result = await closeProject(ctx, alice, projectId, {
        ...baseRepository,
        getProject: async () => ({ ...baseProject, status: "open", assignee: group }),
      });
      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who closed the project:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
});
