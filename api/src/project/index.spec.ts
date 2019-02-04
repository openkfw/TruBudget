import { assert } from "chai";

import { assign, Assigner, AssignmentNotifier, getAllVisible, ListReader, Reader } from ".";
import * as Project from ".";
import Intent from "../authz/intents";
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
    const extendedPermissions = { "project.viewDetails": ["alice", "bob"] };
    const project = newProject("aliceProject", permissions);
    project.log = [
      { intent: "global.createProject", snapshot: { displayName: "aliceProject", permissions } },
      { intent: "project.update", snapshot: { displayName: "renamed", permissions } },
      {
        intent: "project.intent.grantPermission",
        snapshot: { displayName: "renamed", permissions: extendedPermissions },
      },
      {
        intent: "project.intent.revokePermission",
        snapshot: { displayName: "renamed", permissions },
      },
      { intent: "project.assign", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.createSubproject", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.close", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.archive", snapshot: { displayName: "renamed", permissions } },
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;
    const isRedacted = index => scrubbed.log[index] === null;
    const hasPermissions = event => event.snapshot.permissions !== undefined;

    // Permissions are not visible for any event:
    assert.isTrue(scrubbed.log.every(event => event === null || !hasPermissions(event)));

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
    const extendedPermissions = { "project.viewSummary": ["alice", "bob"] };
    const project = newProject("aliceProject", permissions);
    project.log = [
      { intent: "global.createProject", snapshot: { displayName: "aliceProject", permissions } },
      { intent: "project.update", snapshot: { displayName: "renamed", permissions } },
      {
        intent: "project.intent.grantPermission",
        snapshot: { displayName: "renamed", permissions: extendedPermissions },
      },
      {
        intent: "project.intent.revokePermission",
        snapshot: { displayName: "renamed", permissions },
      },
      { intent: "project.assign", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.createSubproject", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.close", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.archive", snapshot: { displayName: "renamed", permissions } },
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;
    const isRedacted = index => scrubbed.log[index] === null;
    const hasPermissions = event => event.snapshot.permissions !== undefined;

    // Permissions are not visible for any event:
    assert.isTrue(scrubbed.log.every(event => event === null || !hasPermissions(event)));

    assert.isTrue(hasIntent(0, "global.createProject"));
    assert.isTrue(isRedacted(1));
    assert.isTrue(isRedacted(2));
    assert.isTrue(isRedacted(3));
    assert.isTrue(isRedacted(4));
    assert.isTrue(isRedacted(5));
    assert.isTrue(hasIntent(6, "project.close"));
    assert.isTrue(hasIntent(7, "project.archive"));
  });

  it("also returns permission-related events, given a project.listPermissions permission.", async () => {
    const user: User = { id: "alice", groups: [] };
    const permissions = {
      "project.viewDetails": ["alice"],
      "project.intent.listPermissions": ["alice"],
      "subproject.intent.listPermissions": ["alice"],
    };
    const extendedPermissions = { "project.viewDetails": ["alice", "bob"] };
    const project = newProject("aliceProject", permissions);
    project.log = [
      { intent: "global.createProject", snapshot: { displayName: "aliceProject", permissions } },
      { intent: "project.update", snapshot: { displayName: "renamed", permissions } },
      {
        intent: "project.intent.grantPermission",
        snapshot: { displayName: "renamed", permissions: extendedPermissions },
      },
      {
        intent: "project.intent.revokePermission",
        snapshot: { displayName: "renamed", permissions },
      },
      { intent: "project.assign", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.createSubproject", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.close", snapshot: { displayName: "renamed", permissions } },
      { intent: "project.archive", snapshot: { displayName: "renamed", permissions } },
    ];

    const scrubbed = await Project.getOne(user, project.id, { getProject: async () => project });

    assert.equal(scrubbed.log.length, 8);

    const hasIntent = (index, intent) => scrubbed.log[index]!.intent === intent;
    const isRedacted = index => scrubbed.log[index] === null;
    const hasPermissions = event => event.snapshot.permissions !== undefined;

    // Permissions are visible for all events:
    assert.isTrue(scrubbed.log.every(hasPermissions));

    assert.isTrue(hasIntent(0, "global.createProject"));
    assert.isTrue(hasIntent(1, "project.update"));
    assert.isTrue(hasIntent(2, "project.intent.grantPermission"));
    assert.isTrue(hasIntent(3, "project.intent.revokePermission"));
    assert.isTrue(hasIntent(4, "project.assign"));
    assert.isTrue(hasIntent(5, "project.createSubproject"));
    assert.isTrue(hasIntent(6, "project.close"));
    assert.isTrue(hasIntent(7, "project.archive"));
  });

  it("The project.listPermissions permission relates to all events, including those in the past.", async () => {
    const isRedacted = (p: Project.ScrubbedProject, idx: number) => p.log[idx] === null;

    const user: User = { id: "alice", groups: [] };

    // Initially, Alice cannot see the project:

    const initialPermissions = {};
    const project = newProject("test", initialPermissions);
    project.log = [
      {
        intent: "global.createProject",
        snapshot: { displayName: "test", permissions: initialPermissions },
      },
    ];

    await assertIsRejectedWith(
      Project.getOne(user, project.id, {
        getProject: async () => project,
      }),
      Error,
    );

    // When we assign the required permission to Alice,
    // she should be able to see the original event as well:

    const newPermissions = {
      "project.viewDetails": ["alice"],
      "project.intent.listPermissions": ["alice"],
    };
    project.permissions = newPermissions;
    project.log = [
      {
        intent: "global.createProject",
        snapshot: { displayName: "test", permissions: initialPermissions },
      },
      {
        intent: "project.intent.grantPermission",
        snapshot: { displayName: "test", permissions: newPermissions },
      },
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

    const newPermissions = {
      "project.intent.listPermissions": ["bob"],
      "project.viewDetails": ["bob"],
    };
    const projectWithListPermission = newProject("bobProject", newPermissions);
    const projectNoListPermission = newProject("aliceProject", {
      "project.viewDetails": ["bob"],
    });

    const permissions = await Project.getPermissions(user, "bobProject", {
      getProject: async () => projectWithListPermission,
    });
    assert.deepEqual(permissions, newPermissions);

    await assertIsRejectedWith(
      Project.getPermissions(user, "bobProject", {
        getProject: async () => projectNoListPermission,
      }),
      Error,
    );
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

    await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps), Error);

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
    await assertIsRejectedWith(assign(alice, "nonAssignableProject", "bob", deps), Error);

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

    await assertIsRejectedWith(Project.update(alice, "nonAssignableProject", update, deps), Error);

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
