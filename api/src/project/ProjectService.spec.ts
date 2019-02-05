import { assert } from "chai";

import {
  assign,
  Assigner,
  AssignmentNotifier,
  create,
  CreateProjectInput,
  Creator,
  getAllVisible,
  ListReader,
  PermissionListReader,
  Reader,
} from ".";
import * as Project from ".";
import Intent from "../authz/intents";
import { assertIsRejectedWith, assertIsResolved } from "../lib/test/promise";
import { Permissions } from "./Permission";
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

describe("Creating a project,", () => {
  it("requires a specific permission.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice", "otherUser"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: PermissionListReader = async () => {
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

    await assertIsRejectedWith(create(alice, createData, deps), Error);

    assert.equal(createdProjects.size, 1);
  });

  it("do not create a project if the id already exists.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: PermissionListReader = async () => {
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
    await assertIsRejectedWith(create(alice, createData, deps), Error);
  });

  it("auto-generates the project's id if not described.", async () => {
    const alice: User = { id: "alice", groups: ["friends"] };

    const createIntent: Intent = "global.createProject";

    const permissions: Permissions = {
      "global.createProject": ["alice"],
    };

    const existingProject = newProject("aliceProject", { [createIntent]: ["alice"] });

    const permissionLister: PermissionListReader = async () => {
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
