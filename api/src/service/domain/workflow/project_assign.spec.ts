import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { assignProject } from "./project_assign";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const dummy = "dummy";
const baseProject: Project = {
  id: dummy,
  createdAt: new Date().toISOString(),
  status: "open",
  assignee: alice.id,
  displayName: dummy,
  description: dummy,
  projectedBudgets: [],
  permissions: { "project.assign": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  additionalData: {},
  tags: [],
};

describe("assign project: authorization", () => {
  it("Without the project.assign permission, a user cannot change a project's assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject, permissions: {} }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to change a project's assignee.", async () => {
    const assigner = root;
    const assignee = bob;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject, permissions: {} }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("assign project: preconditions", () => {
  it("A user can assign a project to herself.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a project to someone else.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning an already assigned user works (but is a no-op).", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject, assignee: alice.id }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a project to a group.", async () => {
    const assigner = alice;
    const assignedGroup = "alice_and_bob";
    const result = await assignProject(ctx, assigner, dummy, assignedGroup, {
      getProject: async () => ({ ...baseProject }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        if (identity === "alice_and_bob") return ["alice", "bob"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning a user fails if the project cannot be found.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => new Error("some error"),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });

  it("The assignee must not be empty.", async () => {
    const assigner = alice;
    const assignee = ""; // <- not a valid user ID
    const result = await assignProject(ctx, assigner, dummy, assignee, {
      getProject: async () => ({ ...baseProject }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    // InvalidCommand error as the user ID is not valid:
    assert.isTrue(Result.isErr(result));
    // Make TypeScript happy:
    if (Result.isOk(result)) {
      throw result;
    }

    assert.match(result.message, /assignee.*\s+.*empty/);
  });
});

describe("assign project: notifications", () => {
  it("When a user assigns a project to someone else, a notification is issued to the new assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        if (identity === "bob") return ["bob"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

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
    );
  });

  it("When a user assigns a project to herself, no notifications are issued.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignProject(ctx, assigner, dummy, assignee.id, {
      getProject: async () => ({ ...baseProject, assignee: bob.id }),
      getUsersForIdentity: async (identity) => {
        if (identity === "alice") return ["alice"];
        throw Error(`unexpected identity: ${identity}`);
      },
    });

    // There is an event representing the assignment, but no notification:
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
    "If a project gets assigned to a group, " +
      "each member, except for the assigner, receives a notificaton.",
    async () => {
      const assigner = alice;
      const assignedGroup = "alice_and_bob_and_charlie";
      const result = await assignProject(ctx, assigner, dummy, assignedGroup, {
        getProject: async () => ({ ...baseProject }),
        getUsersForIdentity: async (identity) => {
          if (identity === "alice") return ["alice"];
          if (identity === "bob") return ["bob"];
          if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
          throw Error(`unexpected identity: ${identity}`);
        },
      });
      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has changed the project's assignee:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
});
