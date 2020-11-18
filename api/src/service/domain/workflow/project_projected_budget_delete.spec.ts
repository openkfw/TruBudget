import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Project } from "./project";
import { deleteProjectedBudget } from "./project_projected_budget_delete";
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
  permissions: {
    "project.budget.deleteProjected": [alice, bob, charlie].map((x) => x.id),
  },
  log: [],
  additionalData: {},
  tags: [],
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

describe("Delete project projected budget: permissions", () => {
  it("Without the project.budget.deleteProjected permission, a user cannot delete a projected budget.", async () => {
    const result = await deleteProjectedBudget(ctx, alice, projectId, "Othertestcorp", "EUR", {
      ...baseRepository,
      getProject: async () => ({ ...baseProject, permissions: {} }),
    });

    // NotAuthorized error due to the missing permissions:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });

  it("The root user doesn't need permission to delete a projected budget", async () => {
    const projectedBudget = {
      organization: "Testcorp",
      currencyCode: "EUR",
    };
    const result = await deleteProjectedBudget(
      ctx,
      root,
      projectId,
      projectedBudget.organization,
      projectedBudget.currencyCode,
      {
        ...baseRepository,
        getProject: async () => ({
          ...baseProject,
          permissions: {},
          projectedBudgets: [
            {
              organization: projectedBudget.organization,
              currencyCode: projectedBudget.currencyCode,
              value: "10000",
            },
          ],
        }),
      },
    );

    // No errors, despite the missing permissions:
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("Deleting a projected budget fails if the project cannot be found.", async () => {
    const result = await deleteProjectedBudget(ctx, alice, projectId, "Othercorp", "EUR", {
      ...baseRepository,
      getProject: async () => new Error("some error"),
    });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });

  it("Deleting a projected budget does nothing if the projected budget cannot be found.", async () => {
    const result = await deleteProjectedBudget(ctx, alice, projectId, "Somecorp", "EUR", {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
        projectedBudgets: [
          {
            organization: "Testcorp",
            currencyCode: "USD",
            value: "10000",
          },
        ],
      }),
    });

    // NotFound error as the project cannot be fetched:
    assert.isTrue(Result.isOk(result));
  });
});

describe("Delete project projected budget: deletion", () => {
  it("The projected budget is not available after deletion", async () => {
    const projectedBudget = {
      organization: "Testcorp",
      currencyCode: "EUR",
    };
    const projectedBudgetToDelete = {
      organization: "Otherestcorp",
      currencyCode: "EUR",
    };
    const result = await deleteProjectedBudget(
      ctx,
      alice,
      projectId,
      projectedBudgetToDelete.organization,
      projectedBudgetToDelete.currencyCode,
      {
        ...baseRepository,
        getProject: async () => ({
          ...baseProject,
          projectedBudgets: [
            {
              organization: projectedBudget.organization,
              value: "10000",
              currencyCode: projectedBudget.currencyCode,
            },
            {
              organization: projectedBudgetToDelete.organization,
              value: "10000",
              currencyCode: projectedBudgetToDelete.currencyCode,
            },
          ],
        }),
      },
    );

    assert.isTrue(Result.isOk(result));
    if (Result.isErr(result)) {
      throw result;
    }
    const { projectedBudgets } = result;
    assert.isTrue(projectedBudgets.length === 1);
  });
});

describe("Deleting Projected Budgets: notifications", () => {
  it("When a user deletes a projected budget, a notification is issued to the assignee.", async () => {
    const result = await deleteProjectedBudget(ctx, alice, projectId, "Testcorp", "EUR", {
      ...baseRepository,
      getProject: async () => ({
        ...baseProject,
        status: "open",
        assignee: bob.id,
        projectedBudgets: [
          {
            organization: "Testcorp",
            value: "10000",
            currencyCode: "EUR",
          },
        ],
      }),
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
        (event) => event.type === "notification_created" && event.recipient === bob.id,
      ),
    );
  });

  it(
    "If the user that deletes a projected budget is assigned to the " +
      "project herself,no notifications are issued.",
    async () => {
      const result = await deleteProjectedBudget(ctx, alice, projectId, "Testcorp", "EUR", {
        ...baseRepository,
        getProject: async () => ({
          ...baseProject,
          status: "open",
          assignee: alice.id,
          projectedBudgets: [
            {
              organization: "Testcorp",
              value: "10000",
              currencyCode: "EUR",
            },
          ],
        }),
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
    },
  );

  it(
    "If a project is assigned to a group when deleting a projected budget, " +
      "each member, except for the user that deletes the projected budget, receives a notificaton.",
    async () => {
      const group = "alice_and_bob_and_charlie";
      const result = await deleteProjectedBudget(ctx, alice, projectId, "Testcorp", "EUR", {
        ...baseRepository,
        getProject: async () => ({
          ...baseProject,
          status: "open",
          assignee: group,
          projectedBudgets: [
            {
              organization: "Testcorp",
              value: "10000",
              currencyCode: "EUR",
            },
          ],
        }),
      });
      assert.isTrue(Result.isOk(result), (result as Error).message);
      // Make TypeScript happy:
      if (Result.isErr(result)) {
        throw result;
      }
      const { newEvents } = result;

      // A notification has been issued to both Bob and Charlie, but not to Alice, as she
      // is the user who deleted the projected budget:
      function isNotificationFor(userId: string): (e: BusinessEvent) => boolean {
        return (event) => event.type === "notification_created" && event.recipient === userId;
      }

      assert.isFalse(newEvents.some(isNotificationFor("alice")));
      assert.isTrue(newEvents.some(isNotificationFor("bob")));
      assert.isTrue(newEvents.some(isNotificationFor("charlie")));
    },
  );
});
