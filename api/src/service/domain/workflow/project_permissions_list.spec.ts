import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as Project from "./project";
import { getProjectPermissions } from "./project_permissions_list";

const ctx: Ctx = { requestId: "", source: "test" };
const bob: ServiceUser = { id: "bob", groups: [] };
const projectId = "unitTestId";
const permissions: Permissions = {
  "project.intent.listPermissions": ["bob"],
};
const baseProject: Project.Project = {
  id: projectId,
  createdAt: new Date().toString(),
  status: "open",
  assignee: bob.id,
  displayName: "unitTestName",
  description: "",
  projectedBudgets: [],
  permissions,
  log: [],
  additionalData: {},
  tags: [],
};

const repository = (returnedProject) => {
  return { getProject: async () => returnedProject };
};

describe("List project permissions: authorization", () => {
  it("With the 'project.intent.listPermissions' permission, the user can list project permissions", async () => {
    const result = await getProjectPermissions(ctx, bob, projectId, repository(baseProject));

    assert.equal(Result.unwrap(result), permissions);
  });
  it("Without the 'project.intent.listPermissions' permission, the user cannot list project permissions", async () => {
    const projectWithoutPermissions: Project.Project = { ...baseProject, permissions: {} };

    const result = await getProjectPermissions(
      ctx,
      bob,
      projectId,
      repository(projectWithoutPermissions),
    );
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotAuthorized);
  });
});

describe("list project permissions: preconditions", () => {
  it("Listing a project's permissions fails if the project cannot be found", async () => {
    const result = await getProjectPermissions(ctx, bob, projectId, {
      getProject: async () => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });
});
