import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import { ServiceUser } from "../organization/service_user";
import * as ProjectCreate from "./project_create";
import { InvalidCommand } from "../errors/invalid_command";

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

    const { errors } = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({
        permissions: { "global.createProject": [user.id] },
        log: [],
      }),
      projectExists: async _id => false,
    });

    assert.lengthOf(errors, 0);
  });

  it("allows more than one projected budget for the same organization if the currencies are different.", async () => {
    const data: ProjectCreate.RequestData = {
      displayName: "test",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "USD", value: "2" },
      ],
    };

    const { errors } = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({
        permissions: { "global.createProject": [user.id] },
        log: [],
      }),
      projectExists: async _id => false,
    });

    assert.lengthOf(errors, 0);
  });

  it("rejects more than one projected budgets for the same organization if the currencies are the same.", async () => {
    const data: ProjectCreate.RequestData = {
      displayName: "test",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "EUR", value: "2" },
      ],
    };

    const { newEvents, errors } = await ProjectCreate.createProject(ctx, user, data, {
      getGlobalPermissions: async () => ({ permissions: {}, log: [] }),
      projectExists: async _id => false,
    });

    // No new events:
    assert.isEmpty(newEvents);

    // And an InvalidCommand error that refers to "projected budget":
    assert.lengthOf(errors, 1);
    assert.instanceOf(errors[0], InvalidCommand);
    assert.include(errors[0].message, "projected budget");
  });
});
