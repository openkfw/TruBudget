import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import { assignSubproject } from "./subproject_assign";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const subprojectId = "dummy-subproject";
const projectId = "dummy-project";

const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: subprojectId,
  description: subprojectId,
  assignee: alice.id,
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: { "subproject.assign": [alice, bob, charlie].map(x => x.id) },
  log: [],
  additionalData: {},
};

const baseRepository = {
    getSubproject: async () => baseSubproject,
    getUsersForIdentity: async (identity: string) => {
      if (identity === "alice") return ["alice"];
      if (identity === "bob") return ["bob"];
      if (identity === "charlie") return ["charlie"];
      if (identity === "alice_and_bob") return ["alice", "bob"];
      if (identity === "alice_and_bob_and_charlie") return ["alice", "bob", "charlie"];
      if (identity === "root") return ["root"];
      throw Error(`unexpected identity: ${identity}`);
    },
  };

describe("assign subproject: authorization", () => {
  it("Without the subproject.assign permission, a user cannot change a subproject's assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        {
        ...baseRepository,
        getSubproject: async () => ({ ...baseSubproject, permissions: {} }),
      });

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to change a subproject's assignee.", async () => {
    const assigner = root;
    const assignee = bob;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        {
        ...baseRepository,
        getSubproject: async () => ({ ...baseSubproject, permissions: {} }),
      });

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("assign subproject: preconditions", () => {
  it("A user can assign a subproject to herself.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a subproject to someone else.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning an already assigned user works (but is a no-op).", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        {
            ...baseRepository,
            getSubproject: async () => ({ ...baseSubproject, assignee: alice.id }),
          });

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("A user can assign a subproject to a group.", async () => {
    const assigner = alice;
    const assignedGroup = "alice_and_bob";
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignedGroup,
        baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Assigning a user fails if the subproject cannot be found.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        {
            ...baseRepository,
            getSubproject: async () => new Error("some error"),
          });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });

  it("The assignee must not be empty.", async () => {
    const assigner = alice;
    const assignee = ""; // <- not a valid user ID
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee,
        baseRepository,
        );

    // InvalidCommand error as the user ID is not valid:
    assert.isTrue(Result.isErr(result));

    // Make TypeScript happy:
    if (Result.isOk(result)) {
      throw result;
    }
    assert.match(result.message, /assignee.*\s+.*empty/);
  });
});

describe("assign subproject: notifications", () => {
  it("When a user assigns a subproject to someone else, a notification is issued to the new assignee.", async () => {
    const assigner = alice;
    const assignee = bob;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        baseRepository);

    // A notification has been issued to the assignee:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const { newEvents } = result;
    assert.isTrue(
      newEvents.some(
        event => event.type === "notification_created" && event.recipient === assignee.id,
      ),
    );
  });

  it("When a user assignes a subproject to herself, no notifications are issued.", async () => {
    const assigner = alice;
    const assignee = alice;
    const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignee.id,
        {
          ...baseRepository,
          getSubproject: async () => ({ ...baseSubproject, assignee: "" }),
        });

    // There is an event representing the assignment, but no notification:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // Make TypeScript happy:
    if (Result.isErr(result)) {
      throw result;
    }
    const { newEvents } = result;
    assert.isTrue(newEvents.length > 0);
    assert.isFalse(
        newEvents.some(event => event.type === "notification_created"));
  });

  it(
    "If a subproject gets assigned to a group, " +
      "each member, except for the assigner, receives a notificaton.",
    async () => {
      const assigner = alice;
      const assignedGroup = "alice_and_bob_and_charlie";
      const result = await assignSubproject(
        ctx,
        assigner,
        projectId,
        subprojectId,
        assignedGroup,
        baseRepository);

      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has changed the project's assignee:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return event => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
 });
