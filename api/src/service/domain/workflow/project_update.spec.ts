import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { updateProject } from "./project_update";
import { Modification } from "./project_updated";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const bob: ServiceUser = { id: "bob", groups: ["alice_and_bob", "alice_and_bob_and_charlie"] };
const charlie: ServiceUser = { id: "charlie", groups: ["alice_and_bob_and_charlie"] };
const projectId = "dummy-project";
const projectName = "dummy";

const baseProject: Project = {
  id: projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: projectName,
  description: projectName,
  assignee: alice.id,
  projectedBudgets: [],
  permissions: { "project.update": [alice, bob, charlie].map((x) => x.id) },
  log: [],
  tags: [],
  additionalData: {},
};

const baseRepository = {
  getProject: async () => baseProject,
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

describe("update project: authorization", () => {
  it("Without the project.update permission, a user cannot update a project", async () => {
    const modification: Modification = {
      displayName: projectName,
    };

    const result = await updateProject(ctx, alice, projectId, modification, {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
        permissions: {},
      }),
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to update a project", async () => {
    const modification: Modification = { displayName: projectName };
    const result = await updateProject(ctx, root, projectId, modification, {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
        permissions: {},
      }),
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});

describe("update project: how modifications are applied", () => {
  it("An update that contains current values only is ignored", async () => {
    const modification: Modification = {
      displayName: projectName,
      description: projectName,
    };
    const result = await updateProject(ctx, alice, projectId, modification, baseRepository);

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);

    // But there are no new events:
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it("The description field can be cleared as an empty string is allowed there", async () => {
    const modification: Modification = {
      description: "",
    };
    const result = await updateProject(ctx, alice, projectId, modification, baseRepository);

    assert.isTrue(Result.isOk(result), (result as Error).message);

    // There are new events and the project's description has been cleared:
    assert.isAtLeast(Result.unwrap(result).length, 1);
    const { update } = result[0];
    assert.equal(update.description, "");
  });

  it("The displayName field cannot be cleared as it is a required field", async () => {
    const modification: Modification = {
      displayName: "",
    };
    const result = await updateProject(ctx, alice, projectId, modification, baseRepository);

    assert.isTrue(Result.isErr(result));
    const error = Result.unwrap_err(result);
    assert.match(error.message, /displayName.*\s+.*empty/);
  });

  it(
    "An empty update is not allowed, as it must contain at least one of " +
      "displayName, description, thumbnail, additionalData, tags",
    async () => {
      const modification: Modification = {};
      const result = await updateProject(ctx, alice, projectId, modification, baseRepository);

      assert.isTrue(Result.isErr(result), (result as Error).message);
      const error = Result.unwrap_err(result);
    },
  );

  it("A closed project cannot be updated", async () => {
    const modification: Modification = {
      description: "Some update",
    };
    const result = await updateProject(ctx, alice, projectId, modification, {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
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
    const modification: Modification = {
      additionalData: {
        a: "updated value",
        b: "new value",
      },
    };
    const result = await updateProject(ctx, alice, projectId, modification, {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
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

  it("Updating fails for an invalid project ID", async () => {
    const modification: Modification = {
      description: "Some update",
    };
    const result = await updateProject(ctx, alice, projectId, modification, {
      ...baseRepository,
      getProject: async () => new Error("some error"),
    });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});

describe("update project: notifications", () => {
  it("When a user updates an assigned project, a notification is issued to the assignee", async () => {
    const modification: Modification = {
      description: "New description.",
    };
    const result = await updateProject(ctx, alice, projectId, modification, {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
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
    // an update that contains current values only is ignored
    const modification: Modification = {
      displayName: projectName,
    };
    const result = await updateProject(ctx, alice, projectId, modification, baseRepository);

    // It works:
    assert.isTrue(Result.isOk(result), (result as Error).message);

    // But no notifications have been issued (in fact there are no new events at all):
    assert.lengthOf(Result.unwrap(result), 0);
  });

  it(
    "When a user updates a project that is assigned to a group, " +
      "each member, except for the user that invoked the update, receives a notification",
    async () => {
      const modification: Modification = {
        description: "New description.",
      };
      const result = await updateProject(ctx, alice, projectId, modification, {
        ...baseRepository,
        getProject: async () => ({
          ...baseProject,
          description: "A description.",
          assignee: "alice_and_bob_and_charlie",
        }),
      });

      assert.isTrue(Result.isOk(result), (result as Error).message);
      const res = Result.unwrap(result);

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who has updated the project:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(res.some(isNotificationFor("alice")));
      assert.isTrue(res.some(isNotificationFor("bob")));
      assert.isTrue(res.some(isNotificationFor("charlie")));
    },
  );
});
