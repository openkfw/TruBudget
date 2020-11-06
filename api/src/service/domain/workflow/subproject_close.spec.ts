import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import { closeSubproject } from "./subproject_close";
import { Workflowitem } from "./workflowitem";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy-workflowitem";
const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "dummy",
  description: "dummy",
  assignee: alice.id,
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: {},
  log: [],
  additionalData: {},
};
const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  assignee: "alice.id",
  documents: [],
  permissions: { "workflowitem.assign": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

const baseRepository = {
  getSubproject: async () => baseSubproject,
  getWorkflowitems: async () => [],
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

describe("close subproject", () => {
  const workflowitem: Workflowitem = { ...baseWorkflowitem, status: "closed" };
  it("Closing a subproject works if all workflowitems are closed.", async () => {
    const result = await closeSubproject(ctx, root, projectId, subprojectId, {
      ...baseRepository,
      getWorkflowitems: async () => [workflowitem, workflowitem],
    });

    assert.isTrue(Result.isOk(result));
  });

  it("The root user doesn't need permission to close a subproject.", async () => {
    const result = await closeSubproject(ctx, root, projectId, subprojectId, baseRepository);

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("close subproject: preconditions", () => {
  it("A user may not close a subproject if he/she is not assigned", async () => {
    const result = await closeSubproject(ctx, bob, projectId, subprojectId, baseRepository);

    // PreconditionError error due to no assignment:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("The root user doesn't need to be assigned to close a subproject.", async () => {
    const result = await closeSubproject(ctx, root, projectId, subprojectId, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A subproject may not be closed if there is at least one non-closed workflowitem.", async () => {
    const result = await closeSubproject(ctx, root, projectId, subprojectId, {
      ...baseRepository,
      getWorkflowitems: async () => [baseWorkflowitem],
    });

    // PreconditionError due to open subproject:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, PreconditionError);
  });

  it("Closing a subproject fails if the subproject cannot be found.", async () => {
    const result = await closeSubproject(ctx, root, projectId, subprojectId, {
      ...baseRepository,
      getSubproject: async () => new NotFound(ctx, "subproject", subprojectId),
    });

    // NotFound error as the subproject cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});

describe("close subproject: notifications", () => {
  it("Closing an already closed subproject works, but nothing happens and no notifications are issued.", async () => {
    const closedSubproject: Subproject = { ...baseSubproject, status: "closed" };
    const result = await closeSubproject(ctx, root, projectId, subprojectId, {
      ...baseRepository,
      getSubproject: async () => closedSubproject,
    });

    // It worked:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) throw result;
    const { newEvents } = result;

    // It's a no-op:
    assert.lengthOf(newEvents, 0);
  });

  it("If the user that closes a subproject is assigned to the subproject herself, no notifications are issued.", async () => {
    const result = await closeSubproject(ctx, alice, projectId, subprojectId, {
      ...baseRepository,
      getSubproject: async () => baseSubproject,
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
    "If a subproject is assigned to a group when closing it, " +
      "each member, except for the user that closes it, receives a notificaton.",
    async () => {
      const assignee = "alice_and_bob_and_charlie";
      const subproject: Subproject = { ...baseSubproject, assignee };
      const result = await closeSubproject(ctx, alice, projectId, subprojectId, {
        ...baseRepository,
        getSubproject: async () => subproject,
      });

      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who closed the subproject:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
});
