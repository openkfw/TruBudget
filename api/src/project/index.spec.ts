import { assert } from "chai";

import {
  assign,
  Assigner,
  AssignmentNotifier,
  create,
  CreateProjectInput,
  Creator,
  getAllVisible,
  GlobalPermissionsLister,
  Reader,
} from ".";
import * as Project from ".";
import Intent from "../authz/intents";
import { Permissions } from "../authz/types";
import { assertIsRejectedWith, assertIsResolved } from "../lib/test/promise";
import { User } from "./User";

function newProject(id: string, permissions: object): Project.Project {
  return {
    id,
    creationUnixTs: `${new Date().getTime()}`,
    status: "open",
    displayName: "A test project",
    assignee: "my-user",
    description: "This is a project created for, and during, testing.",
    amount: "1234",
    currency: "EUR",
    thumbnail: "",
    permissions,
    log: [],
  };
}

function logEntry(
  key: string,
  intent: Intent,
  displayName: string,
  dataVersion: number = 1,
  data?: any,
): Project.HistoryEvent {
  return {
    key,
    intent,
    createdBy: `test ${__filename}`,
    createdAt: new Date().toISOString(),
    dataVersion,
    data,
    snapshot: {
      displayName,
    },
  };
}

describe("Listing projects", () => {
  it("does not include projects you're not allowed to see.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const viewIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
    for (const viewIntent of viewIntents) {
      const projectVisibleToBob = newProject("bobProject", { [viewIntent]: ["bob"] });
      const projectVisibleToFriends = newProject("friendsProject", { [viewIntent]: ["friends"] });
      const nonVisibleProject = newProject("hiddenProject", {});

      const projects = [projectVisibleToBob, projectVisibleToFriends, nonVisibleProject];

      const visibleProjects = await getAllVisible(user, { getAllProjects: async () => projects });

      assert.equal(visibleProjects.length, 2);
      assert.equal(visibleProjects[0].id, "bobProject");
      assert.equal(visibleProjects[1].id, "friendsProject");
    }
  });

  it("returns all but permissions-related events, given a project.viewDetails permission.", async () => {
    const user: User = { id: "alice", groups: [] };
    const permissions = { "project.viewDetails": ["alice"] };
    const project = newProject("aliceProject", permissions);
    project.log = [
      logEntry(project.id, "global.createProject", "aliceProject"),
      logEntry(project.id, "project.update", "renamed"),
      logEntry(project.id, "project.intent.grantPermission", "renamed"),
      logEntry(project.id, "project.intent.revokePermission", "renamed"),
      logEntry(project.id, "project.assign", "renamed"),
      logEntry(project.id, "project.createSubproject", "renamed"),
      logEntry(project.id, "project.close", "renamed"),
      logEntry(project.id, "project.archive", "renamed"),
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;
    const isRedacted = index => scrubbed.log[index] === null;

    assert.isTrue(hasIntent(0, "global.createProject"));
    assert.isTrue(hasIntent(1, "project.update"));
    assert.isTrue(isRedacted(2));
    assert.isTrue(isRedacted(3));
    assert.isTrue(hasIntent(4, "project.assign"));
    assert.isTrue(hasIntent(5, "project.createSubproject"));
    assert.isTrue(hasIntent(6, "project.close"));
    assert.isTrue(hasIntent(7, "project.archive"));
  });

  it("returns only creation, closing and archival events, given a project.viewSummary permission.", async () => {
    const user: User = { id: "alice", groups: [] };
    const permissions = { "project.viewSummary": ["alice"] };
    const project = newProject("aliceProject", permissions);
    project.log = [
      logEntry(project.id, "global.createProject", "aliceProject"),
      logEntry(project.id, "project.update", "renamed"),
      logEntry(project.id, "project.intent.grantPermission", "renamed"),
      logEntry(project.id, "project.intent.revokePermission", "renamed"),
      logEntry(project.id, "project.assign", "renamed"),
      logEntry(project.id, "project.createSubproject", "renamed"),
      logEntry(project.id, "project.close", "renamed"),
      logEntry(project.id, "project.archive", "renamed"),
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;
    const isRedacted = index => scrubbed.log[index] === null;

    assert.isTrue(hasIntent(0, "global.createProject"));
    assert.isTrue(isRedacted(1));
    assert.isTrue(isRedacted(2));
    assert.isTrue(isRedacted(3));
    assert.isTrue(isRedacted(4));
    assert.isTrue(isRedacted(5));
    assert.isTrue(hasIntent(6, "project.close"));
    assert.isTrue(hasIntent(7, "project.archive"));
  });

  it("also returns permission-related events, given a project.intent.listPermissions permission.", async () => {
    const user: User = { id: "alice", groups: [] };
    const permissions = {
      "project.viewDetails": ["alice"],
      "project.intent.listPermissions": ["alice"],
    };
    const project = newProject("aliceProject", permissions);
    project.log = [
      logEntry(project.id, "global.createProject", "aliceProject"),
      logEntry(project.id, "project.update", "renamed"),
      logEntry(project.id, "project.intent.grantPermission", "renamed"),
      logEntry(project.id, "project.intent.revokePermission", "renamed"),
      logEntry(project.id, "project.assign", "renamed"),
      logEntry(project.id, "project.createSubproject", "renamed"),
      logEntry(project.id, "project.close", "renamed"),
      logEntry(project.id, "project.archive", "renamed"),
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;

    assert.isTrue(hasIntent(0, "global.createProject"));
    assert.isTrue(hasIntent(1, "project.update"));
    assert.isTrue(hasIntent(2, "project.intent.grantPermission"));
    assert.isTrue(hasIntent(3, "project.intent.revokePermission"));
    assert.isTrue(hasIntent(4, "project.assign"));
    assert.isTrue(hasIntent(5, "project.createSubproject"));
    assert.isTrue(hasIntent(6, "project.close"));
    assert.isTrue(hasIntent(7, "project.archive"));
  });

  it("relates to all events, including those in the past.", async () => {
    const isRedacted = (p: Project.ScrubbedProject, idx: number) => p.log[idx] === null;

    const user: User = { id: "alice", groups: [] };

    // Initially, Alice cannot see the project:

    const initialPermissions = {};
    const project = newProject("test", initialPermissions);
    project.log = [logEntry(project.id, "global.createProject", "test")];

    await assertIsRejectedWith(
      Project.getOne(user, project.id, {
        getProject: async () => project,
      }),
    );

    // When we assign the required permission to Alice,
    // she should be able to see the original event as well:

    const newPermissions = {
      "project.viewDetails": ["alice"],
      "project.intent.listPermissions": ["alice"],
    };
    project.permissions = newPermissions;
    project.log = [
      logEntry(project.id, "global.createProject", "test"),
      logEntry(project.id, "project.intent.grantPermission", "test"),
    ];

    const afterGrantingPermission = await Project.getOne(user, project.id, {
      getProject: async () => project,
    });
    assert.equal(afterGrantingPermission.log.length, 2);
    assert.isFalse(isRedacted(afterGrantingPermission, 0));
    assert.isFalse(isRedacted(afterGrantingPermission, 1));
  });
});

describe("Listing project permissions", () => {
  it("requires a specific permission.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const newPermissions: Permissions = {
      "project.intent.listPermissions": ["bob"],
      "project.viewDetails": ["bob"],
    };
    const projectWithListPermission = newProject("bobProject", newPermissions);
    const projectWithoutListPermission = newProject("aliceProject", {
      "project.viewDetails": ["bob"],
    });

    const projectReader = async id => {
      switch (id) {
        case "bobProject":
          return projectWithListPermission;
        case "aliceProject":
          return projectWithoutListPermission;
        default:
          return Promise.reject(id);
      }
    };

    const calls = new Map<string, number>();
    const getProjectPermissions = async id => {
      calls.set(id, (calls.get(id) || 0) + 1);
      return newPermissions;
    };
    const permissions = await Project.getPermissions(user, "bobProject", {
      getProject: async () => projectWithListPermission,
      getProjectPermissions,
    });
    assert.deepEqual(permissions, newPermissions);

    await assertIsRejectedWith(
      Project.getPermissions(user, "aliceProject", {
        getProject: projectReader,
        getProjectPermissions,
      }),
    );
    assert.equal(calls.size, 1);
  });
});

describe("Creating a project,", () => {
  it("requires a specific permission.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice", "otherUser"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: GlobalPermissionsLister = async () => {
      return permissions;
    };
    const projectReader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(existingProject);
        default:
          return Promise.reject(id);
      }
    };

    const createdProjects = new Map<string, Project.Project>();
    const creator: Creator = (data): Promise<void> => {
      createdProjects.set(data.displayName, data);
      return Promise.resolve();
    };

    const createData: CreateProjectInput = {
      displayName: "testProject",
      description: "testDescription",
      amount: "5000",
      currency: "EUR",
      id: "testId",
      creationUnixTs: "1548771169",
      status: "open",
      assignee: "alice",
      thumbnail: "testThumbnail",
    };

    const createdProject: Project.Project = {
      displayName: "testProject",
      description: "testDescription",
      amount: "5000",
      currency: "EUR",
      id: "testId",
      creationUnixTs: "1548771169",
      status: "open",
      assignee: "alice",
      thumbnail: "testThumbnail",
      permissions: {
        "project.viewSummary": ["alice"],
        "project.viewDetails": ["alice"],
        "project.assign": ["alice"],
        "project.update": ["alice"],
        "project.intent.listPermissions": ["alice"],
        "project.intent.grantPermission": ["alice"],
        "project.intent.revokePermission": ["alice"],
        "project.createSubproject": ["alice"],
        "project.viewHistory": ["alice"],
        "project.close": ["alice"],
      },
      log: [],
    };

    const deps = {
      getAllPermissions: permissionLister,
      getProject: projectReader,
      createProject: creator,
    };

    await assertIsResolved(create(alice, createData, deps));
    assert.deepEqual(createdProjects.get(createData.displayName), createdProject);

    permissions["global.createProject"] = ["otherUser"];

    await assertIsRejectedWith(create(alice, createData, deps));

    assert.equal(createdProjects.size, 1);
  });

  it("do not create a project if the id already exists.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: GlobalPermissionsLister = async () => {
      return permissions;
    };
    const projectReader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(existingProject);
        default:
          return Promise.reject(id);
      }
    };

    const creator: Creator = (data): Promise<void> => {
      return Promise.resolve();
    };

    const createData: CreateProjectInput = {
      displayName: "testProject",
      description: "testDescription",
      amount: "5000",
      currency: "EUR",
      id: "aliceProject",
      creationUnixTs: "1548771169",
      status: "open",
      assignee: "alice",
      thumbnail: "testThumbnail",
    };

    const deps = {
      getAllPermissions: permissionLister,
      getProject: projectReader,
      createProject: creator,
    };
    await assertIsRejectedWith(create(alice, createData, deps));
  });

  it("auto-generates the project's id if not described.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: GlobalPermissionsLister = async () => {
      return permissions;
    };
    const projectReader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(existingProject);
        default:
          return Promise.reject(id);
      }
    };

    const generatedProjectIds = new Map<string, string>();
    const creator: Creator = (data): Promise<void> => {
      generatedProjectIds.set(data.displayName, data.id);
      return Promise.resolve();
    };

    const createData: CreateProjectInput = {
      displayName: "testProject",
      description: "testDescription",
      amount: "5000",
      currency: "EUR",
    };

    const deps = {
      getAllPermissions: permissionLister,
      getProject: projectReader,
      createProject: creator,
    };
    await assertIsResolved(create(alice, createData, deps));
    const projectId = generatedProjectIds.get("testProject");
    assert.isString(projectId);
    assert.equal(projectId!.length, 32);
  });
});

describe("Granting project permissions", () => {
  it("requires a specific permission.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const commonPermissions = {
      "project.intent.listPermissions": ["bob"],
      "project.viewDetails": ["bob"],
    };
    const bobProject = newProject("bobProject", {
      ...commonPermissions,
      "project.intent.grantPermission": ["bob"],
    });
    const aliceProject = newProject("aliceProject", {
      ...commonPermissions,
      "project.intent.grantPermission": [],
    });

    const projectReader = async id => {
      switch (id) {
        case "bobProject":
          return bobProject;
        case "aliceProject":
          return aliceProject;
        default:
          return Promise.reject(id);
      }
    };

    const granter = async (projectId, grantee, intent) => {
      switch (projectId) {
        case "bobProject":
          if (bobProject.permissions[intent]) {
            bobProject.permissions[intent].push(grantee);
          } else {
            bobProject.permissions[intent] = [grantee];
          }
          return;
        case "aliceProject":
          if (aliceProject.permissions[intent]) {
            aliceProject.permissions[intent].push(grantee);
          } else {
            aliceProject.permissions[intent] = [grantee];
          }
          return;
        default:
          return Promise.reject(projectId);
      }
    };
    await assertIsResolved(
      Project.grantPermission(user, "bobProject", "alice", "project.viewSummary", {
        getProject: projectReader,
        grantProjectPermission: granter,
      }),
    );
    assert.deepEqual(bobProject.permissions["project.viewSummary"], ["alice"]);

    await assertIsRejectedWith(
      Project.grantPermission(user, "aliceProject", "alice", "project.viewSummary", {
        getProject: projectReader,
        grantProjectPermission: granter,
      }),
    );
    assert.isUndefined(aliceProject.permissions["project.viewSummary"]);
  });
});

describe("Assigning a project,", () => {
  it("requires a specific permission.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const assignIntent: Intent = "project.assign";

    const projectAssignableToAlice = newProject("aliceProject", { [assignIntent]: ["alice"] });
    const projectAssignableToFriends = newProject("friendsProject", {
      [assignIntent]: ["friends"],
    });
    const nonAssignableProject = newProject("nonAssignableProject", {});

    const reader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(projectAssignableToAlice);
        case "friendsProject":
          return Promise.resolve(projectAssignableToFriends);
        case "nonAssignableProject":
          return Promise.resolve(nonAssignableProject);
        default:
          return Promise.reject(id);
      }
    };

    const calls = new Map<string, number>();
    const assigner: Assigner = (projectId: string, _assignee: string): Promise<void> => {
      calls.set(projectId, (calls.get(projectId) || 0) + 1);
      return Promise.resolve();
    };

    const notifier: AssignmentNotifier = (
      project: Project.Project,
      _assigner: string,
    ): Promise<void> => Promise.resolve();

    const deps = {
      getProject: reader,
      saveProjectAssignment: assigner,
      notify: notifier,
    };

    await assertIsResolved(assign(alice, "aliceProject", "bob", deps));

    await assertIsResolved(assign(alice, "friendsProject", "bob", deps));

    await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps));

    assert.equal(calls.get("aliceProject"), 1);
    assert.equal(calls.get("friendsProject"), 1);
    assert.isUndefined(calls.get("nonAssignableProject"));
  });

  it("tells the notifier about the event only if successful.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const assignIntent: Intent = "project.assign";

    const projectAssignableToAlice = newProject("aliceProject", { [assignIntent]: ["alice"] });
    const projectAssignableToFriends = newProject("friendsProject", {
      [assignIntent]: ["friends"],
    });
    const nonAssignableProject = newProject("nonAssignableProject", {});

    const reader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(projectAssignableToAlice);
        case "nonAssignableProject":
          return Promise.resolve(nonAssignableProject);
        default:
          return Promise.reject(id);
      }
    };

    const assigner: Assigner = (projectId: string, _assignee: string): Promise<void> =>
      Promise.resolve();

    const calls = new Map<string, number>();
    const notifier: AssignmentNotifier = (
      project: Project.Project,
      _assigner: string,
    ): Promise<void> => {
      calls.set(project.id, (calls.get(project.id) || 0) + 1);
      return Promise.resolve();
    };

    const deps = {
      getProject: reader,
      saveProjectAssignment: assigner,
      notify: notifier,
    };

    await assertIsResolved(assign(alice, "aliceProject", "bob", deps));
    await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps));

    assert.equal(calls.get("aliceProject"), 1);
    assert.isUndefined(calls.get("nonAssignableProject"));
  });
});

describe("Updating a project", () => {
  const alice: User = { id: "alice", groups: ["friends"] };
  const updateIntent: Intent = "project.update";
  const notifier: Project.UpdateNotifier = (_updatedProject, _update) => Promise.resolve();

  it("requires a specific permission.", async () => {
    const projectUpdateableFromAlice = newProject("aliceProject", { [updateIntent]: ["alice"] });
    const projectUpdateableFromFriends = newProject("friendsProject", {
      [updateIntent]: ["friends"],
    });
    const nonUpdateableProject = newProject("nonUpdateableProject", {});

    const reader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(projectUpdateableFromAlice);
        case "friendsProject":
          return Promise.resolve(projectUpdateableFromFriends);
        case "nonAssignableProject":
          return Promise.resolve(nonUpdateableProject);
        default:
          return Promise.reject(id);
      }
    };

    const calls = new Map<string, number>();
    const updater: Project.Updater = (projectId, _update) => {
      calls.set(projectId, (calls.get(projectId) || 0) + 1);
      return Promise.resolve();
    };

    const deps = {
      getProject: reader,
      updateProject: updater,
      notify: notifier,
    };

    const update: Project.Update = {
      displayName: "newName",
      description: "update my project",
      amount: "500",
      currency: "EUR",
      thumbnail: "a new thumbnail",
    };
    await assertIsResolved(Project.update(alice, "aliceProject", update, deps));

    await assertIsResolved(Project.update(alice, "friendsProject", update, deps));

    await assertIsRejectedWith(Project.update(alice, "nonAssignableProject", update, deps));

    assert.equal(calls.get("aliceProject"), 1);
    assert.equal(calls.get("friendsProject"), 1);
    assert.isUndefined(calls.get("nonAssignableProject"));
  });

  it("with an empty update succeeds as a no-op.", async () => {
    const projectUpdateableFromAlice = newProject("aliceProject", { [updateIntent]: ["alice"] });

    const reader: Reader = id => {
      switch (id) {
        case "aliceProject":
          return Promise.resolve(projectUpdateableFromAlice);
        default:
          return Promise.reject(id);
      }
    };

    const calls = new Map<string, number>();
    const updater: Project.Updater = (projectId, _update) => {
      calls.set(projectId, (calls.get(projectId) || 0) + 1);
      return Promise.resolve();
    };

    const deps = {
      getProject: reader,
      updateProject: updater,
      notify: notifier,
    };

    const update: Project.Update = {};
    await assertIsResolved(Project.update(alice, "aliceProject", update, deps));

    assert.isUndefined(calls.get("aliceProject"));
  });
});
