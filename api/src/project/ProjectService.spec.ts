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

describe("When listing project,", () => {
  it("filters the list of projects according to the user's permissions.", async () => {
    const user: User = { id: "bob", groups: ["friends"] };

    const viewIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
    for (const viewIntent of viewIntents) {
      const projectVisibleToBob = newProject("bobProject", { [viewIntent]: ["bob"] });
      const projectVisibleToFriends = newProject("friendsProject", { [viewIntent]: ["friends"] });
      const nonVisibleProject = newProject("hiddenProject", {});

      const projects = [projectVisibleToBob, projectVisibleToFriends, nonVisibleProject];

      const lister: ListReader = () => Promise.resolve(projects);

      const visibleProjects = await getAllVisible(user, { getAllProjects: lister });

      assert.equal(visibleProjects.length, 2);
      assert.equal(visibleProjects[0].id, "bobProject");
      assert.equal(visibleProjects[1].id, "friendsProject");
    }
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
