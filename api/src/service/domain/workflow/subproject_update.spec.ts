import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Subproject } from "./subproject";
import { updateSubproject } from "./subproject_update";
import { UpdatedData } from "./subproject_updated";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const subprojectId = "dummy-subproject";
const subprojectName = "dummy";

const baseSubproject: Subproject = {
  id: subprojectId,
  projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: subprojectName,
  description: subprojectName,
  assignee: alice.id,
  currency: "EUR",
  projectedBudgets: [],
  workflowitemOrdering: [],
  permissions: { "subproject.update": [alice, bob, charlie].map((x) => x.id) },
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

describe("update subproject: authorization", () => {
  it("Without the subproject.update permission, a user cannot update a subproject", async () => {
    const modification: UpdatedData = {};
    const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => ({
        ...baseSubproject,
        permissions: {},
      }),
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to update a subproject", async () => {
    const modification: UpdatedData = {};
    const result = await updateSubproject(ctx, root, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => ({
        ...baseSubproject,
        permissions: {},
      }),
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("update subproject: how modifications are applied", () => {
  it("An empty update is ignored", async () => {
    const modification: UpdatedData = {};
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);
    // But there are no new events:
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it("An update that contains current values only is ignored", async () => {
    const modification: UpdatedData = {
      displayName: subprojectName,
      description: subprojectName,
    };
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);

    // But there are no new events:
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it("The description field can be cleared as an empty string is allowed there", async () => {
    const modification: UpdatedData = {
      description: "",
    };
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    assert.isTrue(Result.isOk(result), (result as Error).message);

    // There are new events and the subproject's description has been cleared:
    assert.isAtLeast(Result.unwrap(result).length, 1);
    const { update } = result[0];
    assert.equal(update.description, "");
  });

  it("The displayName field cannot be cleared as it is a required field", async () => {
    const modification: UpdatedData = {
      displayName: "",
    };
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    assert.isTrue(Result.isErr(result));
    const error = Result.unwrap_err(result);
    assert.match(error.message, /displayName.*\s+.*empty/);
  });

  it("The additionalData field can be cleared as an empty field is allowed there", async () => {
    const modification: UpdatedData = {
      additionalData: {},
    };
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);

    // But there are no new events:
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it("A closed subproject cannot be updated", async () => {
    const modification: UpdatedData = {
      description: "Some update",
    };
    const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => ({
        ...baseSubproject,
        status: "closed",
        billingDate: "2019-03-20T10:33:18.856Z",
        description: "A description.",
      }),
    });

    assert.isTrue(Result.isErr(result));
    const error = Result.unwrap_err(result);
    assert.match(error.message, /status/);
  });

  it("An update to additional data adds new items and replaces existing ones", async () => {
    const modification: UpdatedData = {
      additionalData: {
        a: "updated value",
        b: "new value",
      },
    };
    const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => ({
        ...baseSubproject,
        additionalData: {
          a: "old value",
        },
      }),
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);
    const { update } = result[0];
    assert.deepEqual(update.additionalData, {
      a: "updated value",
      b: "new value",
    });
  });

  it("Updating fails for an invalid subproject ID", async () => {
    const modification: UpdatedData = {
      description: "Some update",
    };
    const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => new Error("some error"),
    });

    // NotFound error as the subproject cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});

describe("update subproject: notifications", () => {
  it("When a user updates an assigned subproject, a notification is issued to the assignee", async () => {
    const modification: UpdatedData = {
      description: "New description.",
    };
    const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
      ...baseRepository,
      getSubproject: async () => ({
        ...baseSubproject,
        description: "A description.",
        assignee: bob.id,
      }),
    });

    assert.isTrue(Result.isOk(result), (result as Error).message);

    assert.isTrue(
      Result.unwrap(result).some(
        (event) => event.type === "notification_created" && event.recipient === bob.id,
      ),
    );
  });

  it("When an update is ignored, no notifications are issued", async () => {
    // An empty modification is always ignored:
    const modification: UpdatedData = {};
    const result = await updateSubproject(
      ctx,
      alice,
      projectId,
      subprojectId,
      modification,
      baseRepository,
    );

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);

    // But no notifications have been issued (in fact there are no new events at all):
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it(
    "When a user updates a subproject that is assigned to a group, " +
      "each member, except for the user that invoked the update, receives a notification",
    async () => {
      const modification: UpdatedData = {
        description: "New description.",
      };
      const result = await updateSubproject(ctx, alice, projectId, subprojectId, modification, {
        ...baseRepository,
        getSubproject: async () => ({
          ...baseSubproject,
          description: "A description.",
          assignee: "alice_and_bob_and_charlie",
        }),
      });

      assert.isTrue(Result.isOk(result), (result as Error).message);
      const res = Result.unwrap(result);

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has updated the subproject:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(res.some(isNotificationFor("alice")));
      assert.isTrue(res.some(isNotificationFor("bob")));
      assert.isTrue(res.some(isNotificationFor("charlie")));
    },
  );
});
