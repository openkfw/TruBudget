import { assert } from "chai";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { AlreadyExists } from "../errors/already_exists";
import { ServiceUser } from "../organization/service_user";
import * as ProjectCreate from "./project_create";

const ctx: Ctx = { requestId: "", source: "test" };
const user: ServiceUser = { id: "test", groups: [] };

describe("create project & projected budgets", () => {
  it("allows more than one projected budget for the same currency if the organizations are different.", async () => {
    const data: ProjectCreate.RequestData = {
      displayName: "test",
      projectedBudgets: [
        { organization: "orga1", currencyCode: "EUR", value: "1" },
        { organization: "orga2", currencyCode: "EUR", value: "2" },
      ],
    };

    const createProjectResult = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({
        permissions: { "global.createProject": [user.id] },
        log: [],
      }),
      projectExists: async (_id) => false,
    });

    assert.isTrue(Result.isOk(createProjectResult));
  });

  it("allows more than one projected budget for the same organization if the currencies are different.", async () => {
    const data: ProjectCreate.RequestData = {
      displayName: "test",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "USD", value: "2" },
      ],
    };

    const createProjectResult = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({
        permissions: { "global.createProject": [user.id] },
        log: [],
      }),
      projectExists: async (_id) => false,
    });

    assert.isTrue(Result.isOk(createProjectResult));
  });

  it("rejects more than one projected budgets for the same organization if the currencies are the same.", async () => {
    const data: ProjectCreate.RequestData = {
      displayName: "test",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "EUR", value: "2" },
      ],
    };

    const createProjectResult = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({ permissions: {}, log: [] }),
      projectExists: async (_id) => false,
    });

    // InvalidCommand error that refers to "projected budget":
    assert.isTrue(Result.isErr(createProjectResult));
    // Make TypeScript happy:
    if (Result.isOk(createProjectResult)) {
      throw createProjectResult;
    }
    assert.instanceOf(createProjectResult, AlreadyExists);
    assert.include(createProjectResult.message, "projected budget");
  });
});
