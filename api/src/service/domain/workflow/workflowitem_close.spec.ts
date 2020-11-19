import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import { Workflowitem } from "./workflowitem";
import { closeWorkflowitem } from "./workflowitem_close";

const ctx: Ctx = {
  requestId: "test",
  source: "test",
};
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";

const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: "alice",
  displayName: "dummy",
  description: "dummy",
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: { "subproject.budget.updateProjected": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
};
const baseWorkflowitem: Workflowitem = {
  isRedacted: false,
  id: workflowitemId,
  subprojectId,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: "dummy",
  description: "dummy",
  amountType: "N/A",
  documents: [],
  permissions: {},
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

describe("Closing a workflowitem", () => {
  it("returns NotFound error if workflowitem does not exist.", async () => {
    const workflowitemId = "does-not-exist";

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      workflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([baseWorkflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve(baseSubproject),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isErr(newEventsResult));
    assert.instanceOf(newEventsResult, NotFound);
  });

  it("may be closed by the assignee", async () => {
    const workflowitem = { ...baseWorkflowitem, assignee: alice.id, permissions: {} };

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      workflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([workflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve(baseSubproject),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isOk(newEventsResult));
  });

  it("may not be closed by someone else than the assignee", async () => {
    const workflowitem = { ...baseWorkflowitem, assignee: bob.id, permissions: {} };

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      workflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([workflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve(baseSubproject),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isErr(newEventsResult));
    assert.instanceOf(newEventsResult, PreconditionError);
  });

  it("fails if any previous workflowitem is not closed.", async () => {
    // Both items' status is open
    const firstWorkflowitemId = "first";
    const secondWorkflowitemId = "second";
    const firstWorkflowitem = { ...baseWorkflowitem, id: firstWorkflowitemId };
    const secondWorkflowitem = { ...baseWorkflowitem, id: secondWorkflowitemId };
    const subproject = {
      ...baseSubproject,
      workflowitemOrdering: [firstWorkflowitemId, secondWorkflowitemId],
    };

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      subproject.projectId,
      subproject.id,
      secondWorkflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([firstWorkflowitem, secondWorkflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve(subproject),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isErr(newEventsResult));
    // Make TypeScript happy:
    if (Result.isOk(newEventsResult)) {
      throw newEventsResult;
    }
    assert.instanceOf(newEventsResult, PreconditionError);
    assert.match(newEventsResult.message, /all previous workflowitems must be closed/);
  });

  it("if a validator is set on the parent subproject, the validator may close the workflowitem", async () => {
    const workflowitem = { ...baseWorkflowitem, assignee: alice.id, permissions: {} };

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      workflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([workflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve({ ...baseSubproject, validator: alice.id }),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isOk(newEventsResult));
  });

  it("if a validator is set on the parent subproject, the assignee may not close the workflowitem", async () => {
    const workflowitem = { ...baseWorkflowitem, assignee: alice.id, permissions: {} };

    const newEventsResult = await closeWorkflowitem(
      ctx,
      alice,
      baseSubproject.projectId,
      baseSubproject.id,
      workflowitemId,
      {
        getWorkflowitems: () => Promise.resolve([workflowitem]),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          return Error(`unexpected identity: ${identity}`);
        },
        getSubproject: () => Promise.resolve({ ...baseSubproject, validator: bob.id }),
        applyWorkflowitemType: () => [],
      },
    );
    assert.isTrue(Result.isErr(newEventsResult));
    assert.instanceOf(newEventsResult, PreconditionError);
  });

  it("creates notifications for every assignee in a group if a group is assigned, expect the issuer.", async () => {
    const assignee = "alice_and_bob_and_charlie";
    const workflowitem: Workflowitem = { ...baseWorkflowitem, assignee };
    const result = await closeWorkflowitem(ctx, alice, projectId, subprojectId, workflowitem.id, {
      getWorkflowitems: () => Promise.resolve([workflowitem]),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
        return Error(`unexpected identity: ${identity}`);
      },
      getSubproject: () => Promise.resolve(baseSubproject),
      applyWorkflowitemType: () => [],
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const newEvents = result;

    // A notification has been issued to both Bob and Charlie, but not to Alice, as she
    // is the user who closed the subproject:
    function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
      return (event) => event.type === "notification_created" && event.recipient === userId;
    }

    assert.isTrue(newEvents.some(isNotificationFor("bob")));
    assert.isTrue(newEvents.some(isNotificationFor("charlie")));
  });
});
