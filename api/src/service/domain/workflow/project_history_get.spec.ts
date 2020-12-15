import { assert } from "chai";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { Filter } from "./historyFilter";
import { Project } from "./project";
import { getHistory } from "./project_history_get";
import { ProjectTraceEvent } from "./project_trace_event";

const ctx: Ctx = { requestId: "", source: "test" };
const root: ServiceUser = { id: "root", groups: [] };
const alice: ServiceUser = { id: "alice", groups: [] };
const projectId = "dummy-project";
const projectName = "dummy-Name";
const date = new Date().toISOString();

const filter: Filter = {
  publisher: alice.id,
  startAt: date,
  endAt: date,
  eventType: "project_created",
};

const permissions: Permissions = {
  "project.viewDetails": ["alice"],
  "project.viewHistory": ["alice"],
};

const event: ProjectTraceEvent = {
  entityId: alice.id,
  entityType: "project",
  businessEvent: {
    type: "project_created",
    source: "",
    time: date,
    publisher: alice.id,
    project: {
      id: projectId,
      status: "open",
      assignee: alice.id,
      displayName: "project",
      description: "some description",
      projectedBudgets: [],
      permissions: {},
      additionalData: {},
    },
  },
  snapshot: {
    displayName: "",
  },
};
const baseProject: Project = {
  id: projectId,
  createdAt: new Date().toISOString(),
  status: "open",
  displayName: projectName,
  description: projectName,
  assignee: alice.id,
  projectedBudgets: [],
  permissions,
  log: [event],
  tags: [],
  additionalData: {},
};

const baseRepository = {
  getProject: async () => baseProject,
};

describe("get project history: authorization", () => {
  it("Without the required permissions, a user cannot get a project's history.", async () => {
    const notPermittedProject: Project = {
      ...baseProject,
      permissions: {},
    };
    const result = await getHistory(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => notPermittedProject,
    });
    assert.instanceOf(result, NotAuthorized);
  });

  it("With the required permissions, a user can get a project's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("With only viewDetails permissions, a user can still get a project's history.", async () => {
    const modifiedProject: Project = {
      ...baseProject,
      permissions: { "project.viewDetails": ["alice"] },
    };
    const result = await getHistory(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => modifiedProject,
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("With only viewHistory permissions, a user can still get a project's history.", async () => {
    const modifiedProject: Project = {
      ...baseProject,
      permissions: { "project.viewHistory": ["alice"] },
    };
    const result = await getHistory(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => modifiedProject,
    });
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });

  it("The root user doesn't need permission to get a project's history.", async () => {
    const result = await getHistory(ctx, alice, projectId, baseRepository);
    assert.isTrue(Result.isOk(result), (result as Error).message);
  });
});
describe("get project history: preconditions", () => {
  it("Getting a project's history fails if the project cannot be found", async () => {
    const result = await getHistory(ctx, alice, projectId, {
      ...baseRepository,
      getProject: async () => new Error("some error"),
    });
    assert.isTrue(Result.isErr(result));
    assert.instanceOf(result, NotFound);
  });

  it("the properties of the filter must match the resulted properties exactly", async () => {
    const result = await getHistory(ctx, root, projectId, baseRepository, filter);
    assert.equal(result[0].businessEvent.publisher, alice.id);
    assert.isTrue(filter.startAt && result[0].businessEvent.time >= filter.startAt);
    assert.isTrue(filter.endAt && result[0].businessEvent.time <= filter.endAt);
    assert.equal(result[0].businessEvent.type, filter.eventType);
  });

  it("if one property of the result doesn't match the filter the event is not returned", async () => {
    const editedFilter: Filter = {
      ...filter,
      publisher: root.id,
    };
    const result = await getHistory(ctx, root, projectId, baseRepository, editedFilter);
    assert.isTrue(Result.isOk(result), (result as Error).message);
    assert.isEmpty(result);
  });
  it("if there are more events in a project's history only the one matching the filter is returned", async () => {
    const anotherBusinessEvent: BusinessEvent = {
      type: "project_closed",
      source: "",
      time: date,
      publisher: alice.id,
      projectId,
    };
    const newEvent: ProjectTraceEvent = {
      ...event,
      businessEvent: anotherBusinessEvent,
    };
    const updatedProject: Project = {
      ...baseProject,
      log: [event, newEvent],
    };

    const result = await getHistory(
      ctx,
      root,
      projectId,
      {
        getProject: async () => updatedProject,
      },
      filter,
    );
    assert.equal(Result.unwrap(result).length, 1);
    assert.equal(result[0].businessEvent.publisher, alice.id);
    assert.isTrue(filter.startAt && result[0].businessEvent.time >= filter.startAt);
    assert.isTrue(filter.endAt && result[0].businessEvent.time <= filter.endAt);
    assert.equal(result[0].businessEvent.type, filter.eventType);
  });
});
