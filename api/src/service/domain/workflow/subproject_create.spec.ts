import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import { InvalidCommand } from "../errors/invalid_command";
import { ServiceUser } from "../organization/service_user";
import * as SubprojectCreate from "./subproject_create";

const ctx: Ctx = { requestId: "", source: "test" };
const user: ServiceUser = { id: "test", groups: [] };

describe("create subproject & projected budgets", () => {
  it("allows more than one projected budget for the same currency if the organizations are different.", async () => {
    const data: SubprojectCreate.RequestData = {
      projectId: "test",
      displayName: "test",
      currency: "EUR",
      projectedBudgets: [
        { organization: "orga1", currencyCode: "EUR", value: "1" },
        { organization: "orga2", currencyCode: "EUR", value: "2" },
      ],
    };

    const { errors } = await SubprojectCreate.createSubproject(ctx, user, data, {
      subprojectExists: async (_projectId, _subprojectId) => false,
      projectPermissions: async _projectId => ({ "project.createSubproject": [user.id] }),
    });

    assert.lengthOf(errors, 0);
  });

  it("allows more than one projected budget for the same organization if the currencies are different.", async () => {
    const data: SubprojectCreate.RequestData = {
      projectId: "test",
      displayName: "test",
      currency: "EUR",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "USD", value: "2" },
      ],
    };

    const { errors } = await SubprojectCreate.createSubproject(ctx, user, data, {
      subprojectExists: async (_projectId, _subprojectId) => false,
      projectPermissions: async _projectId => ({ "project.createSubproject": [user.id] }),
    });

    assert.lengthOf(errors, 0);
  });

  it("rejects more than one projected budgets for the same organization if the currencies are the same.", async () => {
    const data: SubprojectCreate.RequestData = {
      projectId: "test",
      displayName: "test",
      currency: "EUR",
      projectedBudgets: [
        { organization: "orga", currencyCode: "EUR", value: "1" },
        { organization: "orga", currencyCode: "EUR", value: "2" },
      ],
    };

    const { newEvents, errors } = await SubprojectCreate.createSubproject(ctx, user, data, {
      subprojectExists: async (_projectId, _subprojectId) => false,
      projectPermissions: async _projectId => ({ "project.createSubproject": [user.id] }),
    });

    // No new events:
    assert.isEmpty(newEvents);

    // And an InvalidCommand error that refers to "projected budget":
    assert.lengthOf(errors, 1);
    assert.instanceOf(errors[0], InvalidCommand);
    assert.include(errors[0].message, "projected budget");
  });
});
