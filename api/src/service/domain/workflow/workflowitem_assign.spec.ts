import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Workflowitem } from "./workflowitem";
import { assignWorkflowitem } from "./workflowitem_assign";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const workflowitemId = "dummy";
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
  permissions: { "workflowitem.assign": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
  workflowitemType: "general",
};

describe("assign workflowitem: authorization", () => {
  it("Without the workflowitem.assign permission, a user cannot change a workflowitem's assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem, permissions: {} }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result), "The request returns an error");
    assert.instanceOf(result, NotAuthorized, "The error is due to missing authorization");
  });

  it("The root user doesn't need permission to change a workflowitem's assignee.", async () => {
    const assigner = root;
    const assignee = bob;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem, permissions: {} }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("assign workflowitem: preconditions", () => {
  it("A user can assign a workflowitem to herself.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a workflowitem to someone else.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning an already assigned user works (but is a no-op).", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem, assignee: alice.id }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a workflowitem to a group.", async () => {
    const assigner = alice;
    const assignedGroup = "alice_and_bob";
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignedGroup,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem, assignee: alice.id }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          if (identity === "alice_and_bob") return ["alice", "bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning a user fails if the workflowitem cannot be found.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => new Error("NotFound"),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // NotFound error as the workflow item cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });

  it("The assignee must not be empty.", async () => {
    const assigner = alice;
    const assignee = ""; // <- not a valid user ID
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // InvalidCommand error as the user ID is not valid:
    assert.isTrue(Result.isErr(result), "The result returns an error");
    // Make TypeScript happy:
    if (Result.isOk(result)) {
      throw result;
    }

    assert.match(result.message, /assignee.*\s+.*empty/);
  });
});

describe("assign workflowitem: notifications", () => {
  it("When a user assigns a workflowitem to someone else, a notification is issued to the new assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // A notification has been issued to the assignee:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const { newEvents } = result;
    assert.isTrue(
      newEvents.some(
        (event) => event.type === "notification_created" && event.recipient === assignee.id,
      ),
      "A new notification has been created",
    );
  });

  it("When a user assigns a workflowitem to herself, no notifications are issued.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignWorkflowitem(
      ctx,
      assigner,
      assignee.id,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async () => ({ ...baseWorkflowitem, assignee: bob.id }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          throw Error(`unexpected identity: ${identity}`);
        },
        applyWorkflowitemType: () => [],
      },
    );

    // There is an event representing the assignment, but no notification:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const { newEvents } = result;
    assert.isTrue(newEvents.length > 0);
    assert.isFalse(
      newEvents.some((event) => event.type === "notification_created"),
      "No notification has been issued",
    );
  });

  it(
    "If a workflowitem gets assigned to a group, " +
      "each member, except for the assigner, receives a notificaton.",
    async () => {
      const assigner = alice;
      const assignedGroup = "alice_and_bob_and_charlie";
      const result = await assignWorkflowitem(
        ctx,
        assigner,
        assignedGroup,
        projectId,
        subprojectId,
        workflowitemId,
        {
          getWorkflowitem: async () => ({ ...baseWorkflowitem }),
          getUsersForIdentity: async (identity) => {
            if (identity === "alice") return ["alice"];
            if (identity === "bob") return ["bob"];
            if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
            throw Error(`unexpected identity: ${identity}`);
          },
          applyWorkflowitemType: () => [],
        },
      );
      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has changed the workflowitem's assignee:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(
        newEvents.some(isNotificationFor("alice")),
        "User 'alice' does not receive a notification",
      );
      assert.isTrue(newEvents.some(isNotificationFor("bob")), "User 'bob' receives a notification");
      assert.isTrue(
        newEvents.some(isNotificationFor("charlie")),
        "User 'charlie' receives a notification",
      );
    },
  );
});
